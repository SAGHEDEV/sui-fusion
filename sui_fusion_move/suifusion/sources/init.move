module suifusion::init {
    use suifusion::registry;
    use sui::tx_context::TxContext;

    public fun init_all(_admin: &signer, _ctx: &mut TxContext) {
        // This function would initialize the registries
        // In a real implementation, you would call registry::init_registries with proper parameters
    }
}