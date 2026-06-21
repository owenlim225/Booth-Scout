use super::{BoothScoutUnlock, ContractError};
use soroban_sdk::testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation};
use soroban_sdk::{token, Address, Env, IntoVal};

const PRICE: i128 = 20_000_000;
const FEE_BPS: u32 = 500;

fn setup() -> (Env, Address, Address, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let strategist = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_client = token::StellarAssetClient::new(&env, &token.address());
    token_client.mint(&buyer, &PRICE);

    let contract_id = env.register(BoothScoutUnlock, ());
    let client = super::BoothScoutUnlockClient::new(&env, &contract_id);
    client.initialize(&admin, &FEE_BPS);
    client.register_strategy(&1_u64, &strategist, &PRICE, &token.address());

    (env, contract_id, admin, buyer, strategist, token.address())
}

#[test]
fn happy_path_unlock_succeeds() {
    let (env, contract_id, _admin, buyer, _strategist, _asset) = setup();
    let client = super::BoothScoutUnlockClient::new(&env, &contract_id);
    client.unlock_strategy(&1_u64, &buyer);
    assert!(client.has_unlock(&1_u64, &buyer));
}

#[test]
fn duplicate_unlock_fails() {
    let (env, contract_id, _admin, buyer, _strategist, _asset) = setup();
    let client = super::BoothScoutUnlockClient::new(&env, &contract_id);
    client.unlock_strategy(&1_u64, &buyer);
    let second = client.try_unlock_strategy(&1_u64, &buyer);
    assert_eq!(second, Err(Ok(ContractError::AlreadyUnlocked)));
}

#[test]
fn state_verification_transitions_false_to_true() {
    let (env, contract_id, _admin, buyer, _strategist, _asset) = setup();
    let client = super::BoothScoutUnlockClient::new(&env, &contract_id);
    assert!(!client.has_unlock(&1_u64, &buyer));
    client.unlock_strategy(&1_u64, &buyer);
    assert!(client.has_unlock(&1_u64, &buyer));
}

#[test]
fn fee_verification_matches_expected_split() {
    let (env, contract_id, admin, buyer, strategist, _asset) = setup();
    let client = super::BoothScoutUnlockClient::new(&env, &contract_id);
    client.unlock_strategy(&1_u64, &buyer);

    let platform = client.get_earnings(&admin);
    let creator = client.get_earnings(&strategist);
    assert_eq!(platform, 1_000_000);
    assert_eq!(creator, 19_000_000);
}

#[test]
fn authorization_or_missing_strategy_fails() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let buyer = Address::generate(&env);
    let contract_id = env.register(BoothScoutUnlock, ());
    let client = super::BoothScoutUnlockClient::new(&env, &contract_id);

    env.mock_auths(&[(
        &admin,
        AuthorizedInvocation {
            function: AuthorizedFunction::Contract((
                contract_id.clone(),
                "initialize".into_val(&env),
                (admin.clone(), FEE_BPS).into_val(&env),
            )),
            sub_invocations: std::vec![],
        },
    )]);
    client.initialize(&admin, &FEE_BPS);

    let missing = client.try_unlock_strategy(&1_u64, &buyer);
    assert_eq!(missing, Err(Ok(ContractError::StrategyNotFound)));
}
