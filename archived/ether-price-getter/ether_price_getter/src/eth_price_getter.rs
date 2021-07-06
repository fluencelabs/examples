/*
 * Copyright 2021 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

use crate::curl_request;
use marine_rs_sdk::marine;

static URL_LATEST: &'static str =
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";

#[marine]
pub fn ether_price_getter(api_key: String, currency_symbol: String) -> String {
    let curl_args = f!(
        r#"-H "X-CMC_PRO_API_KEY: {api_key}" -H "Accept: application/json" -d "symbol=ETH&convert={currency_symbol}" -G {URL_LATEST}"#
    );
    let response = curl_request(vec![curl_args]);
    String::from_utf8(response.stdout).unwrap()
}
