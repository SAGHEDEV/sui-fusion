module suifusion::profile {
    use suifusion::registry;
    use sui::tx_context::TxContext;

    /// Create profile: name and avatar_url are bytes vectors (utf-8)
    public fun create_profile(account: &signer, name: vector<u8>, avatar_url: vector<u8>, ctx: &mut TxContext) {
        registry::create_profile(account, name, avatar_url, ctx);
    }
}