#[test_only]
module suifusion::simple_test {
    #[test]
    public fun test_assert_true() {
        assert!(true, 0);
    }
    
    #[test]
    #[expected_failure]
    public fun test_assert_false() {
        assert!(false, 0);
    }
}