fn main() {}

#[cfg(test)]
mod tests {
    use marine_rs_sdk_test::marine_test;
    #[marine_test(
        producer(
            config_path = "../producer/Config.toml",
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
        let input = marine_test_env::producer::modules::producer::Input {
            first_name: String::from("John"),
            last_name: String::from("Doe"),
        };
        let data = producer.modules.producer.produce(input);
        let consumer_data = marine_test_env::consumer::modules::consumer::Data { name: data.name };
        let result = consumer.modules.consumer.consume(consumer_data);
        assert_eq!(result, "John Doe")
    }
}
