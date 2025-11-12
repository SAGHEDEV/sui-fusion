module sui_fusion_contract::suifusion_contract;

use std::string::{Self, String};
use std::vector;
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::object::{Self, UID};
use sui::sui::SUI;
use sui::table::{Self, Table};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

/// Profile struct
public struct Profile has key, store {
    id: UID,
    owner: address,
    name: String,
    avatar_url: String,
    created_at: u64,
}

/// Tip struct
public struct Tip has key, store {
    id: UID,
    amount: u64,
    sender: address,
    time: u64,
}

/// Stream struct (stream_id changed to String)
public struct Stream has key, store {
    id: UID,
    owner: address,
    name: String,
    description: String,
    thumbnail_url: String,
    playback_id: String,
    playback_url: String,
    stream_id: String,
    stream_key: String,
    chat_id: String,
    categories: vector<String>,
    total_tips: u64,
    tips: vector<Tip>,
    is_active: bool,
    created_at: u64,
}

/// Profile Registry
public struct ProfileRegistry has key {
    id: UID,
    profiles: Table<address, Profile>,
    total_profiles: u64,
}

/// Stream Registry (stream_id => String)
public struct StreamRegistry has key {
    id: UID,
    streams: Table<String, Stream>, // ✅ changed from Table<u64, Stream>
    user_streams: Table<address, vector<String>>, // ✅ changed to vector<String>
    counter: u64,
    all_stream_ids: vector<String>,
    active_streams: vector<String>,
}

/// Tip pool
public struct TipPool has key {
    id: UID,
    balance: Balance<SUI>,
}

/// Events
public struct ProfileCreated has copy, drop {
    owner: address,
    name: String,
    timestamp: u64,
}

public struct StreamCreated has copy, drop {
    stream_id: String,
    owner: address,
    name: String,
    timestamp: u64,
}

public struct StreamEnded has copy, drop {
    stream_id: String,
    owner: address,
    timestamp: u64,
}

public struct TipSent has copy, drop {
    stream_id: String,
    sender: address,
    recipient: address,
    amount: u64,
    timestamp: u64,
}

/// Init contract
fun init(ctx: &mut TxContext) {
    let profile_registry = ProfileRegistry {
        id: object::new(ctx),
        profiles: table::new(ctx),
        total_profiles: 0,
    };
    transfer::share_object(profile_registry);

    let stream_registry = StreamRegistry {
        id: object::new(ctx),
        streams: table::new(ctx),
        user_streams: table::new(ctx),
        counter: 0,
        all_stream_ids: vector::empty<String>(),
        active_streams: vector::empty<String>(),
    };
    transfer::share_object(stream_registry);

    let tip_pool = TipPool {
        id: object::new(ctx),
        balance: balance::zero<SUI>(),
    };
    transfer::share_object(tip_pool);
}

/// Create Profile
public entry fun create_profile(
    registry: &mut ProfileRegistry,
    name: vector<u8>,
    avatar_url: vector<u8>,
    ctx: &mut TxContext,
) {
    let owner = tx_context::sender(ctx);
    assert!(!table::contains(&registry.profiles, owner), 1);

    let profile = Profile {
        id: object::new(ctx),
        owner,
        name: string::utf8(name),
        avatar_url: string::utf8(avatar_url),
        created_at: tx_context::epoch_timestamp_ms(ctx),
    };

    table::add(&mut registry.profiles, owner, profile);
    registry.total_profiles = registry.total_profiles + 1;

    sui::event::emit(ProfileCreated {
        owner,
        name: string::utf8(name),
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}

/// Update Profile
public entry fun update_profile(
    registry: &mut ProfileRegistry,
    name: vector<u8>,
    avatar_url: vector<u8>,
    ctx: &mut TxContext,
) {
    let owner = tx_context::sender(ctx);
    assert!(table::contains(&registry.profiles, owner), 2);

    let profile = table::borrow_mut(&mut registry.profiles, owner);
    profile.name = string::utf8(name);
    profile.avatar_url = string::utf8(avatar_url);
}

/// Create Stream
public entry fun create_stream(
    registry: &mut StreamRegistry,
    name: vector<u8>,
    description: vector<u8>,
    thumbnail_url: vector<u8>,
    playback_id: vector<u8>,
    playback_url: vector<u8>,
    stream_id: vector<u8>,
    stream_key: vector<u8>,
    chat_id: vector<u8>,
    categories: vector<vector<u8>>,
    ctx: &mut TxContext,
) {
    let owner = tx_context::sender(ctx);
    registry.counter = registry.counter + 1;

    let mut category_strings = vector::empty<String>();
    let mut i = 0;
    let cat_len = vector::length(&categories);
    while (i < cat_len) {
        let cat = vector::borrow(&categories, i);
        vector::push_back(&mut category_strings, string::utf8(*cat));
        i = i + 1;
    };

    // let stream_id_str = string::utf8(stream_id);

    // 🧠 Helper: clone the string by copying its bytes
    // let stream_id_clone = string::utf8(vector::copy(string::bytes(&stream_id_str)));

    let stream = Stream {
        id: object::new(ctx),
        owner,
        name: string::utf8(name),
        description: string::utf8(description),
        thumbnail_url: string::utf8(thumbnail_url),
        playback_id: string::utf8(playback_id),
        playback_url: string::utf8(playback_url),
        stream_id: string::utf8(stream_id),
        stream_key: string::utf8(stream_key),
        chat_id: string::utf8(chat_id),
        categories: category_strings,
        total_tips: 0,
        tips: vector::empty<Tip>(),
        is_active: true,
        created_at: tx_context::epoch_timestamp_ms(ctx),
    };

    table::add(&mut registry.streams, string::utf8(stream_id), stream);
    vector::push_back(&mut registry.all_stream_ids, string::utf8(stream_id));
    vector::push_back(&mut registry.active_streams, string::utf8(stream_id));

    if (!table::contains(&registry.user_streams, owner)) {
        table::add(&mut registry.user_streams, owner, vector::empty<String>());
    };

    let user_stream_list = table::borrow_mut(&mut registry.user_streams, owner);
    vector::push_back(user_stream_list, string::utf8(stream_id));

    sui::event::emit(StreamCreated {
        stream_id: string::utf8(stream_id),
        owner,
        name: string::utf8(name),
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}




/// End Stream
public entry fun end_stream(registry: &mut StreamRegistry, stream_id: vector<u8>, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    let stream_id_str = string::utf8(stream_id);

    assert!(table::contains(&registry.streams, stream_id_str), 3);

    let stream = table::borrow_mut(&mut registry.streams, stream_id_str);
    assert!(stream.owner == sender, 4);
    assert!(stream.is_active, 5);

    stream.is_active = false;

    let mut i = 0;
    let len = vector::length(&registry.active_streams);
    while (i < len) {
        if (*vector::borrow(&registry.active_streams, i) == stream.stream_id) {
            vector::remove(&mut registry.active_streams, i);
            break
        };
        i = i + 1;
    };

    sui::event::emit(StreamEnded {
        stream_id: stream.stream_id,
        owner: sender,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}


/// Send Tip
public entry fun send_tip(
    registry: &mut StreamRegistry,
    tip_pool: &mut TipPool,
    stream_id: vector<u8>,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    let stream_id_str = string::utf8(stream_id);

    assert!(table::contains(&registry.streams, stream_id_str), 3);

    let stream = table::borrow_mut(&mut registry.streams, stream_id_str);
    assert!(stream.is_active, 6);

    let amount = coin::value(&payment);
    assert!(amount > 0, 7);

    let tip = Tip {
        id: object::new(ctx),
        amount,
        sender,
        time: tx_context::epoch_timestamp_ms(ctx),
    };

    vector::push_back(&mut stream.tips, tip);
    stream.total_tips = stream.total_tips + amount;

    transfer::public_transfer(payment, stream.owner);

    sui::event::emit(TipSent {
        stream_id: stream.stream_id,
        sender,
        recipient: stream.owner,
        amount,
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    });
}


/// Get profile
public fun get_profile(registry: &ProfileRegistry, owner: address): &Profile {
    table::borrow(&registry.profiles, owner)
}

/// Get stream
public fun get_stream(registry: &StreamRegistry, stream_id: vector<u8>): &Stream {
    let sid = string::utf8(stream_id);
    table::borrow(&registry.streams, sid)
}

/// Profile exists
public fun profile_exists(registry: &ProfileRegistry, owner: address): bool {
    table::contains(&registry.profiles, owner)
}

/// Stream exists
public fun stream_exists(registry: &StreamRegistry, stream_id: vector<u8>): bool {
    let sid = string::utf8(stream_id);
    table::contains(&registry.streams, sid)
}

/// Get all active streams
public fun get_active_streams(registry: &StreamRegistry): &vector<String> {
    &registry.active_streams
}

/// Get totals
public fun get_total_streams(registry: &StreamRegistry): u64 {
    registry.counter
}

public fun get_total_profiles(registry: &ProfileRegistry): u64 {
    registry.total_profiles
}
