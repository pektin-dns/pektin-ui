import { Container, MenuItem, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

import { ArrowRight } from "@material-ui/icons";
import { Component } from "react";
import * as l from "../lib";
import * as t from "../types";

const f = fetch;

interface WanderlustProps {
    import: any;
}
interface WanderlustState {
    domainName: string;
    providerName: string;
    console: string;
}

export default class Wanderlust extends Component<WanderlustProps, WanderlustState> {
    state: WanderlustState = {
        domainName: "",
        providerName: "Google",
        console: ""
    };
    walk = async (name: string, provider: string, limit: number = 100) => {
        const parseData = (n: string[]) => {
            n = n.splice(1);
            n = n.filter((e: string) => {
                if (!(e === "NSEC" || e === "RRSIG")) return true;
                return false;
            });
            return n;
        };
        const ogName = l.absoluteName(name);
        let currentName = ogName;
        const allRecordsRequests: Array<Promise<any>> = [];
        const allTypes: string[] = [];
        for (let i = 0; i < limit; i++) {
            const newNameRes = await providers[provider](currentName, "NSEC");
            const newNameData = newNameRes.data.split(" ");
            /*eslint no-loop-func: "off"*/

            if (newNameRes.typeId !== 47) break;
            parseData(newNameData).forEach(coveredRecord => {
                allTypes.push(coveredRecord);
                allRecordsRequests.push(providers[provider](currentName, coveredRecord));
            });
            this.setState({ console: currentName });
            currentName = newNameData[0];
            if (newNameData[0] === ogName && i > 0) break;
        }
        const allRecords: t.SimpleDnsRecord[] = await Promise.all(allRecordsRequests);
        return allRecords;
        //console.log(allRecords.map(l.simpleDnsRecordToRedisEntry));
    };
    handleChange = (e: any) => {
        this.setState(state => ({ ...state, [e.target.name]: e.target.value }));
    };
    import = async () => {
        const records = await this.walk(this.state.domainName, this.state.providerName, 2000);
        this.props.import(records);
    };

    render() {
        return (
            <Container style={{ position: "relative" }}>
                <TextField
                    InputLabelProps={{
                        shrink: true
                    }}
                    style={{ paddingRight: "20px" }}
                    helperText="The domain you want to import"
                    placeholder="example.com"
                    value={this.state.domainName}
                    onChange={this.handleChange}
                    name="domainName"
                    label="Domain Name"
                    variant="standard"
                />
                <TextField
                    label="DNS Provider"
                    helperText="Where to send the queries to"
                    select
                    style={{ width: "170px" }}
                    onChange={e => this.setState({ providerName: e.target.value })}
                    value={this.state.providerName}
                    variant="standard"
                >
                    {Object.keys(providers).map((e, i) => {
                        return (
                            <MenuItem key={e} value={e}>
                                {e}
                            </MenuItem>
                        );
                    })}
                </TextField>
                <LoadingButton
                    disabled={this.state.domainName.length ? false : true}
                    loading={this.state.console.length ? true : false}
                    onClick={this.import}
                    style={{ position: "absolute", bottom: "10px", right: "10px" }}
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowRight />}
                >
                    Import
                </LoadingButton>
                <div>{this.state.console}</div>
            </Container>
        );
    }
}

type getDnsRecord = (name: string, type: string) => Promise<any>;

const providers: { [provider: string]: getDnsRecord } = {
    Google: async (name: string, type: string): Promise<any> => {
        const res = await f(`https://dns.google/resolve?name=${name}&type=${type}`);
        const json = await res.json();
        const answer = json.Answer ? json.Answer[0] : json.Authority[0];
        answer.ttl = answer.TTL;
        delete answer.TTL;
        answer.typeId = answer.type;
        answer.type = type;
        return answer;
    },
    Cloudflare: async (name: string, type: string): Promise<any> => {
        const res = await f(`https://cloudflare-dns.com/dns-query?name=${name}&type=${type}`, { headers: { accept: "application/dns-json" } });
        const json = await res.json();
        const answer = json.Answer ? json.Answer[0] : json.Authority[0];
        answer.ttl = answer.TTL;
        delete answer.TTL;
        answer.typeId = answer.type;
        answer.type = type;
        return answer;
    }
};