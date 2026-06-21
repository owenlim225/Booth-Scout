#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Symbol,
};

#[derive(Clone)]
#[contracttype]
pub struct Strategy {
    pub strategist: Address,
    pub price: i128,
    pub asset: Address,
    pub active: bool,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    PlatformFeeBps,
    Strategy(u64),
    Unlock(u64, Address),
    StrategistEarnings(Address),
    PlatformEarnings,
    Initialized,
}

#[contracterror]
#[derive(Clone, Copy, Eq, PartialEq)]
pub enum ContractError {
    AlreadyInitialized = 1,
    InvalidFeeBps = 2,
    StrategyNotFound = 3,
    AlreadyUnlocked = 4,
    InactiveStrategy = 5,
    PriceMustBePositive = 6,
}

#[contract]
pub struct BoothScoutUnlock;

#[contractimpl]
impl BoothScoutUnlock {
    pub fn initialize(env: Env, admin: Address, platform_fee_bps: u32) -> Result<(), ContractError> {
        admin.require_auth();
        if env.storage().instance().has(&DataKey::Initialized) {
            return Err(ContractError::AlreadyInitialized);
        }
        if platform_fee_bps > 10_000 {
            return Err(ContractError::InvalidFeeBps);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::PlatformFeeBps, &platform_fee_bps);
        env.storage().instance().set(&DataKey::PlatformEarnings, &0_i128);
        env.storage().instance().set(&DataKey::Initialized, &true);
        Ok(())
    }

    pub fn register_strategy(
        env: Env,
        strategy_id: u64,
        strategist: Address,
        price: i128,
        asset: Address,
    ) -> Result<(), ContractError> {
        let admin = Self::load_admin(&env);
        admin.require_auth();
        if price <= 0 {
            return Err(ContractError::PriceMustBePositive);
        }
        let strategy = Strategy {
            strategist,
            price,
            asset,
            active: true,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Strategy(strategy_id), &strategy);
        Ok(())
    }

    pub fn unlock_strategy(env: Env, strategy_id: u64, buyer: Address) -> Result<(), ContractError> {
        buyer.require_auth();

        if Self::has_unlock(env.clone(), strategy_id, buyer.clone()) {
            return Err(ContractError::AlreadyUnlocked);
        }

        let strategy = Self::load_strategy(&env, strategy_id)?;
        if !strategy.active {
            return Err(ContractError::InactiveStrategy);
        }

        let fee_bps = Self::load_platform_fee_bps(&env);
        let platform_fee = strategy.price * i128::from(fee_bps) / 10_000;
        let strategist_share = strategy.price - platform_fee;

        let token_client = token::Client::new(&env, &strategy.asset);
        let contract = env.current_contract_address();
        let admin = Self::load_admin(&env);

        token_client.transfer(&buyer, &contract, &strategy.price);
        token_client.transfer(&contract, &admin, &platform_fee);
        token_client.transfer(&contract, &strategy.strategist, &strategist_share);

        env.storage()
            .persistent()
            .set(&DataKey::Unlock(strategy_id, buyer.clone()), &true);

        let strategist_total = Self::get_earnings(env.clone(), strategy.strategist.clone()) + strategist_share;
        env.storage()
            .persistent()
            .set(&DataKey::StrategistEarnings(strategy.strategist.clone()), &strategist_total);

        let platform_total = Self::platform_earnings(&env) + platform_fee;
        env.storage()
            .instance()
            .set(&DataKey::PlatformEarnings, &platform_total);

        env.events().publish(
            (Symbol::new(&env, "unlock"), strategy_id),
            (buyer, strategy.strategist, strategy.price),
        );

        Ok(())
    }

    pub fn has_unlock(env: Env, strategy_id: u64, buyer: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::Unlock(strategy_id, buyer))
            .unwrap_or(false)
    }

    pub fn get_strategy(env: Env, strategy_id: u64) -> Result<Strategy, ContractError> {
        Self::load_strategy(&env, strategy_id)
    }

    pub fn get_earnings(env: Env, address: Address) -> i128 {
        let admin = Self::load_admin(&env);
        if address == admin {
            return Self::platform_earnings(&env);
        }

        env.storage()
            .persistent()
            .get(&DataKey::StrategistEarnings(address))
            .unwrap_or(0)
    }

    fn load_admin(env: &Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("admin must be initialized")
    }

    fn load_platform_fee_bps(env: &Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::PlatformFeeBps)
            .expect("platform fee must be initialized")
    }

    fn load_strategy(env: &Env, strategy_id: u64) -> Result<Strategy, ContractError> {
        env.storage()
            .persistent()
            .get(&DataKey::Strategy(strategy_id))
            .ok_or(ContractError::StrategyNotFound)
    }

    fn platform_earnings(env: &Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::PlatformEarnings)
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
