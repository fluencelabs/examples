fn main() {}

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;
    #[marine_test(
        producer(
            config_path = "../producer/Config.toml", // <- 1
            modules_dir = "../producer/artifacts"
        ),
        consumer(
            config_path = "../consumer/Config.toml",
            modules_dir = "../consumer/artifacts"
        )
    )]
    fn test() {
        let mut producer = marine_test_env::producer::ServiceInterface::new();
        let mut consumer = marine_test_env::consumer::ServiceInterface::new();
        let input = marine_test_env::producer::Input {
            first_name: String::from("John"),
            last_name: String::from("Doe"),
        };
        let data = producer.produce(input);
        let result = consumer.consume(data);
        assert_eq!(result, "John Doe")
    }
}
