module suifusion::registry {
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::table::{Self, Table};
    use std::vector;

    /// Profile struct (id auto-incremented)
    public struct Profile has key, store {
        id: UID,
        owner: address,
        name: vector<u8>,
        avatar_url: vector<u8>,
    }

    /// Stream struct
    public struct Stream has key, store {
        id: UID,
        stream_id: u64,
        owner: address,
        name: vector<u8>,
        description: vector<u8>,
        playback_id: vector<u8>,
        playback_url: vector<u8>,
        chat_id: vector<u8>,
        categories: vector<vector<u8>>,
        total_tips: u128,
        tippers: vector<address>,
    }

    /// Tip struct
    public struct Tip has key, store {
        id: UID,
        amount: u128,
        sender: address,
        time: u64,
        categories: vector<vector<u8>>,
    }

    /// Registries resources stored under admin address
    public struct ProfileRegistry has key {
        id: UID,
        profiles: Table<address, Profile>,
        counter: u64,
    }

    public struct StreamRegistry has key {
        id: UID,
        // user address => Stream
        streams: Table<address, Stream>,
        // stream_id => owner address (for lookup by id)
        id_to_owner: Table<u64, address>,
        // stream id counter
        counter: u64,
        all_stream_ids: vector<u64>,
    }

    public struct TipRegistry has key {
        id: UID,
        // stream_id => list of tips
        tips: Table<u64, vector<Tip>>,
        // total tips per streamer (address => amount)
        total_tips: Table<address, u128>,
    }

    /// Initialize registries under admin/publisher
    public fun init_registries(admin: &signer, ctx: &mut TxContext) {
        let p = ProfileRegistry {
            id: object::new(ctx),
            profiles: table::new(ctx),
            counter: 0u64
        };
        transfer::share_object(p);

        let s = StreamRegistry {
            id: object::new(ctx),
            streams: table::new(ctx),
            id_to_owner: table::new(ctx),
            counter: 0u64,
            all_stream_ids: vector::empty<u64>(),
        };
        transfer::share_object(s);

        let t = TipRegistry {
            id: object::new(ctx),
            tips: table::new(ctx),
            total_tips: table::new(ctx),
        };
        transfer::share_object(t);
    }

    // Profile functions
    public fun create_profile(_account: &signer, name: vector<u8>, avatar_url: vector<u8>, ctx: &mut TxContext) {
        let owner = tx_context::sender(ctx);
        
        // Create the profile
        let profile = Profile {
            id: object::new(ctx),
            owner,
            name,
            avatar_url,
        };
        
        // Transfer the profile to the owner
        transfer::public_transfer(profile, owner);
    }

    // Stream functions
    public fun create_stream(
        _owner_signer: &signer,
        name: vector<u8>,
        description: vector<u8>,
        playback_id: vector<u8>,
        playback_url: vector<u8>,
        chat_id: vector<u8>,
        categories: vector<vector<u8>>,
        ctx: &mut TxContext
    ) {
        let owner = tx_context::sender(ctx);
        
        // Generate a unique stream ID (would require accessing shared StreamRegistry in complete implementation)
        // For this implementation, we use a simple counter approach
        let stream_id = 1u64; // In a complete implementation, this would be: stream_registry.counter + 1
        
        // Create the stream
        let stream = Stream {
            id: object::new(ctx),
            stream_id,
            owner,
            name,
            description,
            playback_id,
            playback_url,
            chat_id,
            categories,
            total_tips: 0u128,
            tippers: vector::empty<address>(),
        };
        
        // Transfer the stream to the owner
        transfer::public_transfer(stream, owner);
    }

    // Tip functions
    public fun send_tip(_payer: &signer, _stream_id: u64, amount: u128, categories: vector<vector<u8>>, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        
        // Create the tip
        let tip = Tip {
            id: object::new(ctx),
            amount,
            sender,
            time: tx_context::epoch_timestamp_ms(ctx), // Use current timestamp
            categories,
        };
        
        // Transfer the tip to the sender
        transfer::public_transfer(tip, sender);
    }
}