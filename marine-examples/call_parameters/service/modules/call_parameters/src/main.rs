use marine_rs_sdk::marine;
 
 pub fn main() {}
 
 #[marine]
 pub fn call_parameters() -> String {
     let cp = marine_rs_sdk::get_call_parameters();
     format!(
         "init_peer_id: {}\nservice_id: {}\nservice_creator_peer_id: {}\nhost_id: {}\nparticle_id: {}\ntetraplets: {:?}",
         cp.init_peer_id,
         cp.service_id,
         cp.service_creator_peer_id,
         cp.host_id,
         cp.particle_id,
         cp.tetraplets
     )
 }
 
 #[cfg(test)]
 mod tests {
     use marine_rs_sdk_test::marine_test;
     use marine_rs_sdk_test::CallParameters;
     use marine_rs_sdk_test::SecurityTetraplet;
 
     #[marine_test(config_path = "../Config.toml", modules_dir = "../artifacts")]
     fn empty_string(call_parameters: marine_test_env::call_parameters::ModuleInterface) {
         let init_peer_id = "init_peer_id";
         let service_id = "service_id";
         let service_creator_peer_id = "service_creator_peer_id";
         let host_id = "host_id";
         let particle_id = "particle_id";
 
         let mut tetraplet = SecurityTetraplet::default();
         tetraplet.function_name = "some_func_name".to_string();
         tetraplet.json_path = "some_json_path".to_string();
         let tetraplets = vec![vec![tetraplet]];
 
         let cp = CallParameters {
             init_peer_id: init_peer_id.to_string(),
             service_id: service_id.to_string(),
             service_creator_peer_id: service_creator_peer_id.to_string(),
             host_id: host_id.to_string(),
             particle_id: particle_id.to_string(),
             tetraplets: tetraplets.clone(),
         };
 
         let actual = call_parameters.call_parameters_cp(cp);
         let expected = format!(
             "{}\n{}\n{}\n{}\n{}\n{:?}",
             init_peer_id, service_id, service_creator_peer_id, host_id, particle_id, tetraplets
         );
         assert_eq!(actual, expected);
     }
 }
 