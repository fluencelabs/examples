use std::collections::HashMap;

pub fn mode<'a>(data: impl ExactSizeIterator<Item = &'a u64>) -> (u32, u64) {
    let frequencies = data
        .into_iter()
        .fold(HashMap::<u64, u32>::new(), |mut freqs, value| {
            *freqs.entry(*value).or_insert(0) += 1;
            freqs
        });

    let mode = frequencies
        .iter()
        .max_by_key(|&(_, count)| count)
        .map(|(value, _)| value)
        .unwrap();

    (*frequencies.get(&mode).unwrap(), *mode)
}

pub fn mean<'a>(data: impl ExactSizeIterator<Item = &'a u64>) -> Option<f64> {
    let n = data.len() as u64;
    if n < 1 {
        return None;
    }
    let res = (data.sum::<u64>() / n) as f64;
    Some(res)
}
