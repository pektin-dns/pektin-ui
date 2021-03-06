import { Container, IconButton, MenuItem, Select, TextField } from "@material-ui/core";
import { Component } from "react";
import * as t from "./types";
import * as l from "./lib";
import { AddCircle, RemoveCircle } from "@material-ui/icons";

interface ConfigProps {
  readonly config: t.Config;
  readonly g: t.Glob;
}
interface ConfigState {
  readonly newKey: string;
  readonly newValue: string;
}
export default class Config extends Component<ConfigProps, ConfigState> {
  state: ConfigState = {
    newKey: "",
    newValue: "",
  };
  handleInputChange = (e: any) => {
    this.setState((state) => ({ ...state, [e.target.name]: e.target.value }));
  };

  // TODO: update value in all entries in redis when variable was changed

  render = () => {
    return (
      <Container>
        <br />
        <h2>Code Style</h2>
        <CodeStylePicker config={this.props.config} g={this.props.g} />
        <br />
        <br />
        <h2>Variables</h2>
        <p>
          These are stored locally in your browser and can be pasted in every input field via the
          context menu (right click)
        </p>
        <p>The default context menu can still be accessed by holding alt, shift or ctrl</p>
        <div>
          <TextField
            value={this.state.newKey}
            name="newKey"
            onChange={this.handleInputChange}
            placeholder="key"
          />
          <TextField
            value={this.state.newValue}
            name="newValue"
            onChange={this.handleInputChange}
            placeholder="value"
          />
          <IconButton
            onClick={() => {
              this.props.g.updateLocalConfig({
                newVariable: { key: this.state.newKey, value: this.state.newValue },
                type: "newVariable",
              });
              this.setState({ newKey: "", newValue: "" });
            }}
          >
            <AddCircle />
          </IconButton>
        </div>

        {this.props.config.local.variables.map((v, i) => {
          return (
            <div key={i}>
              <TextField
                onChange={(e) => this.props.g.updateLocalConfig({ type: "updateVariable", i, e })}
                name="key"
                placeholder="key"
                value={v.key}
              />
              <TextField
                onChange={(e) => this.props.g.updateLocalConfig({ type: "updateVariable", i, e })}
                name="value"
                placeholder="value"
                value={v.value}
              />
              <IconButton
                onClick={(e) => this.props.g.updateLocalConfig({ i, type: "removeVariable" })}
              >
                <RemoveCircle />
              </IconButton>
            </div>
          );
        })}
      </Container>
    );
  };
}
interface CodeStylePickerProps extends ConfigProps {
  className?: string;
}
interface CodeStylePickerState {}
export class CodeStylePicker extends Component<CodeStylePickerProps, CodeStylePickerState> {
  render = () => {
    const codeStyle = this.props?.config?.local?.codeStyle;

    return (
      <Select
        className={this.props.className}
        variant="standard"
        style={{ width: "230px" }}
        /*@ts-ignore*/
        onChange={(e) => this.props.g.updateLocalConfig({ e, type: "codeStyle" })}
        name="codeStyle"
        value={codeStyle}
      >
        {l.codeStyles.map((codeStyle) => (
          <MenuItem className={this.props.className} value={codeStyle} key={codeStyle}>
            {codeStyle}
          </MenuItem>
        ))}
      </Select>
    );
  };
}
/*
                <div>
                    <div contentEditable onInput={(e: any) => this.setState({ field: e.target.innerText })}>
                        {this.state.field.split(this.state.search)[0]}
                        <mark>{this.state.search}</mark>
                        {this.state.field.split(this.state.search)[1]}
                    </div>
                </div>*/
