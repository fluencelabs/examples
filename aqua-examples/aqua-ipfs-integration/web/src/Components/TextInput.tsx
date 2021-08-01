import React from "react";

export const TextInput = (props: {
  text: string;
  value: string | null;
  setValue: (val: string) => void;
}) => {
  return (
    <div className="row">
      <label className="label bold">{props.text}</label>
      <input
        className="input"
        type="text"
        onChange={(e) => props.setValue(e.target.value)}
        value={props.value || ""}
        required={true}
      />
    </div>
  );
};

export const TextWithLabel = (props: {
  text: string;
  value: string | null;
}) => {
  return (
    <div className="row">
      <label className="label bold">{props.text}</label>
      <div className="input-ro">{props.value || ""}</div>
    </div>
  );
};
