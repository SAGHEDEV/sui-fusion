module suifusion::tip {
    use suifusion::registry;
    use sui::tx_context::TxContext;

    /// Create a tip record for a stream (anyone can call). amount is numeric (u128).
    public fun send_tip(_payer: &signer, _stream_id: u64, _amount: u128, _categories: vector<vector<u8>>, _ctx: &mut TxContext) {
        // This function would send a tip
        // In a real implementation, you would call registry::send_tip with proper parameters
    }
}