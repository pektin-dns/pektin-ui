import React, { Component } from "react";
import * as t from "./types";
import * as l from "./lib";
import { Container, Grid, Paper, Switch, Tab, Tabs } from "@material-ui/core";
import { AccountTree } from "@material-ui/icons";
import { SiCurl, SiJavascript } from "react-icons/si";
import { MdShortText } from "react-icons/md";
import { dump as toYaml } from "js-yaml";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import * as codeStyles from "react-syntax-highlighter/dist/esm/styles/hljs";
import { PektinClient } from "@pektin/client";
import { ApiRecord } from "@pektin/client";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("yaml", yaml);
//import parserTypescript from "prettier/parser-typescript";
//import { format } from "prettier/standalone";

interface DataDisplayProps {
  readonly data: t.DisplayRecord[];
  readonly config: t.Config;
  readonly style?: any;
  readonly client: PektinClient;
}

interface DataDisplayState {
  readonly activeTab: number;
}

const noop = (e: any) => {
  if (!e.ctrlKey) {
    e.preventDefault();
    return false;
  }
};

export default class DataDisplay extends Component<DataDisplayProps, DataDisplayState> {
  state: DataDisplayState = {
    activeTab: this.props.config.local.defaultActiveTab,
  };

  render = () => {
    const codeStyle = codeStyles[this.props.config.local.codeStyle];
    const tabs = [
      <SyntaxHighlighter
        contentEditable="true"
        suppressContentEditableWarning={true}
        showLineNumbers={false}
        style={codeStyle}
        onCut={noop}
        onPaste={noop}
        onKeyDown={noop}
        onDragStart={noop}
        language="json"
      >
        {JSON.stringify(
          this.props.data?.map((record) => l.toPektinApiRecord(this.props.config, record)),
          null,
          "    "
        )}
      </SyntaxHighlighter>,
      <SyntaxHighlighter
        contentEditable="true"
        suppressContentEditableWarning={true}
        showLineNumbers={false}
        style={codeStyle}
        onCut={noop}
        onPaste={noop}
        onKeyDown={noop}
        onDragStart={noop}
        language="yaml"
      >
        {toYaml(this.props.data.map((record) => l.toPektinApiRecord(this.props.config, record)))}
      </SyntaxHighlighter>,
      <SyntaxHighlighter
        contentEditable="true"
        showLineNumbers={false}
        style={codeStyle}
        onCut={noop}
        onPaste={noop}
        onKeyDown={noop}
        onDragStart={noop}
        suppressContentEditableWarning={true}
        language="javascript"
      >
        TODO
      </SyntaxHighlighter>,
      <CurlTab
        client={this.props.client}
        config={this.props.config}
        data={this.props.data.map((record) => l.toPektinApiRecord(this.props.config, record))}
      />,
      <SyntaxHighlighter
        contentEditable="true"
        showLineNumbers={false}
        suppressContentEditableWarning={true}
        style={codeStyle}
        onCut={noop}
        onPaste={noop}
        onKeyDown={noop}
        onDragStart={noop}
        language="text"
      >
        {this.props.data
          ?.map((record) => l.toPektinApiRecord(this.props.config, record))
          .map((r) => l.displayRecordToBind(r))}
      </SyntaxHighlighter>,
    ];

    return (
      <Grid
        className="DataDisplay"
        style={{ ...this.props.style, marginBottom: "20px" }}
        item
        xs={12}
      >
        <Paper style={{ height: "100%" }} elevation={3}>
          <div style={{ height: "80px", paddingTop: "0px" }}>
            <Tabs
              variant="fullWidth"
              className="tabHead"
              value={this.state.activeTab}
              onChange={(e, n) => this.setState({ activeTab: n })}
            >
              <Tab
                label="JSON"
                icon={
                  <AccountTree
                    style={{
                      width: "20px",
                      height: "10px",
                      transform: "scale(2)",
                    }}
                  />
                }
                value={0}
              />
              <Tab
                label="YAML"
                icon={
                  <AccountTree
                    style={{
                      width: "20px",
                      height: "10px",
                      transform: "scale(2)",
                    }}
                  />
                }
                value={1}
              />
              <Tab label="JAVASCRIPT" icon={<SiJavascript style={{ width: "20px" }} />} value={2} />
              <Tab label="CURL" icon={<SiCurl style={{ width: "20px" }} />} value={3} />
              <Tab label="BIND" icon={<MdShortText style={{ width: "20px" }} />} value={4} />
            </Tabs>
          </div>
          <div style={{ overflowY: "auto", height: "calc(100% - 80px)" }} className="tabs">
            {tabs[this.state.activeTab]}
          </div>
        </Paper>
      </Grid>
    );
  };
}

interface CurlTabProps {
  readonly data: ApiRecord[];
  readonly config: t.Config;
  readonly client: PektinClient;
}

interface CurlTabState {
  multiline: boolean;
  auth: any;
}
class CurlTab extends Component<CurlTabProps, CurlTabState> {
  state: CurlTabState = {
    multiline: false,
    auth: null,
  };

  curl = (multiline: boolean) => {
    const body = {
      confidant_password: "<REDACTED>",
      client_username: this.props.client.username,
      records: [this.props.data],
    };

    if (multiline)
      return `curl -v ${
        this.props.client.pektinApiEndpoint
      }/set -H "Content-Type: application/json" -d '<< EOF
    ${JSON.stringify(body, null, "    ")} 
    EOF'`;

    return `curl -v ${
      this.props.client.pektinApiEndpoint
    }/set -H "Content-Type: application/json" -d '${JSON.stringify(body)}'`;
  };

  render = () => {
    const codeStyle = codeStyles[this.props.config.local.codeStyle];
    return (
      <React.Fragment>
        <Container style={{ textAlign: "center" }}>
          <Switch onChange={() => this.setState(({ multiline }) => ({ multiline: !multiline }))} />
          Multiline
        </Container>
        <SyntaxHighlighter
          contentEditable="true"
          showLineNumbers={false}
          style={codeStyle}
          onCut={noop}
          onPaste={noop}
          onKeyDown={noop}
          onDragStart={noop}
          language="sh"
        >
          {this.curl(this.state.multiline)}
        </SyntaxHighlighter>
      </React.Fragment>
    );
  };
}
