import React, { Component } from "react";
import * as t from "./types";
import * as l from "./lib";
import * as pektinApi from "./apis/pektin";
import { Box, Container, Grid, Paper, Switch, Tab, Tabs } from "@material-ui/core";
import { AccountTree, Code } from "@material-ui/icons";
import { SiCurl, SiJavascript } from "react-icons/si";
import { MdShortText } from "react-icons/md";
import { dump } from "js-yaml";

import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import * as codeStyles from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("yaml", yaml);
//import parserTypescript from "prettier/parser-typescript";
//import { format } from "prettier/standalone";

interface DataDisplayProps {
    data: t.RedisEntry;
    config: t.Config;
    style?: any;
}

interface DataDisplayState {
    activeTab: number;
}

export default class DataDisplay extends Component<DataDisplayProps, DataDisplayState> {
    state: DataDisplayState = {
        activeTab: this.props.config.local.defaultActiveTab
    };

    render = () => {
        const codeStyle = codeStyles[this.props.config.local.codeStyle];
        const tabs = [
            <SyntaxHighlighter showLineNumbers={true} style={codeStyle} language="json">
                {JSON.stringify(this.props.data, null, "    ")}
            </SyntaxHighlighter>,
            <SyntaxHighlighter showLineNumbers={true} style={codeStyle} language="yaml">
                {dump(this.props.data)}
            </SyntaxHighlighter>,
            <SyntaxHighlighter showLineNumbers={true} style={codeStyle} language="javascript">
                {l.jsTemp(pektinApi.getDomainFromConfig(this.props.config), [this.props.data])}
            </SyntaxHighlighter>,
            <CurlTab config={this.props.config} data={this.props.data}></CurlTab>,
            <SyntaxHighlighter showLineNumbers={true} style={codeStyle} language="text">
                {l.rec0ToBind(this.props.data)}
            </SyntaxHighlighter>
        ];

        return (
            <Grid className="DataDisplay" style={this.props.style ? { ...this.props.style } : {}} container item xs={8}>
                <Grid style={{ marginBottom: "20px" }} item xs={12}>
                    <Paper elevation={3}>
                        <Container>
                            <div className="cardHead">
                                <Code />
                                <span className="caps label">code</span>
                            </div>
                        </Container>
                        <Box>
                            <Tabs variant="fullWidth" value={this.state.activeTab} onChange={(e, n) => this.setState({ activeTab: n })}>
                                <Tab label="JSON" icon={<AccountTree style={{ width: "20px", height: "10px", transform: "scale(2)" }} />} value={0} />
                                <Tab label="YAML" icon={<AccountTree style={{ width: "20px", height: "10px", transform: "scale(2)" }} />} value={1} />
                                <Tab label="JAVASCRIPT" icon={<SiJavascript style={{ width: "25px" }} />} value={2} />
                                <Tab label="CURL" icon={<SiCurl style={{ width: "25px" }} />} value={3} />
                                <Tab label="BIND" icon={<MdShortText style={{ width: "25px" }} />} value={4} />
                            </Tabs>
                        </Box>
                        <Box className="tabs">{tabs[this.state.activeTab]}</Box>
                    </Paper>
                </Grid>
            </Grid>
        );
    };
}

interface CurlTabProps {
    data: t.RedisEntry;
    config: t.Config;
}

interface CurlTabState {
    multiline: boolean;
    auth: any;
}
class CurlTab extends Component<CurlTabProps, CurlTabState> {
    state: CurlTabState = {
        multiline: false,
        auth: null
    };
    componentDidMount = async () => {
        this.setState({ auth: await pektinApi.getAuthFromConfig(this.props.config) });
    };
    curl = (auth: any, data: t.RedisEntry[], multiline: boolean) => {
        const body = { token: auth.dev ? auth.token : "API_TOKEN", records: data };

        if (multiline)
            return `curl -v ${auth.endpoint}/set -H "Content-Type: application/json" -d '<< EOF
    ${JSON.stringify(body, null, "    ")} 
    EOF'`;

        return `curl -v ${auth.endpoint}/set -H "Content-Type: application/json" -d '${JSON.stringify(body)}'`;
    };

    render = () => {
        const codeStyle = codeStyles[this.props.config.local.codeStyle];
        if (!this.state.auth) return <div></div>;
        return (
            <React.Fragment>
                <Container style={{ textAlign: "center" }}>
                    <Switch onChange={() => this.setState(({ multiline }) => ({ multiline: !multiline }))} />
                    Multiline
                </Container>
                <SyntaxHighlighter showLineNumbers={true} style={codeStyle} language="sh">
                    {this.curl(this.state.auth, [this.props.data], this.state.multiline)}
                </SyntaxHighlighter>
            </React.Fragment>
        );
    };
}
