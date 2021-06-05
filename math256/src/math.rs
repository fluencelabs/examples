use crate::errors::Error;
use ethnum::u256;

pub fn add(lhs: String, rhs: String) -> Result<u256, Error> {
    let lhs = lhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let rhs = rhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let result = lhs.checked_add(rhs).ok_or_else(|| Error::Overflow)?;
    Ok(result)
}

pub fn sub(lhs: String, rhs: String) -> Result<u256, Error> {
    let lhs = lhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let rhs = rhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let result = lhs.checked_sub(rhs).ok_or_else(|| Error::Underflow)?;
    Ok(result)
}

pub fn mul(lhs: String, rhs: String) -> Result<u256, Error> {
    let lhs = lhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let rhs = rhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let result = lhs.checked_mul(rhs).ok_or_else(|| Error::Overflow)?;
    Ok(result)
}

pub fn div(lhs: String, rhs: String) -> Result<u256, Error> {
    let lhs = lhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let rhs = rhs.parse::<u256>().map_err(|_| Error::ParseError)?;
    let result = lhs.checked_div(rhs).ok_or_else(|| Error::DivisionByZero)?;
    Ok(result)
}
