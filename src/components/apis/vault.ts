const f = fetch;
interface VaultAuthJSON {
    vaultEndpoint: string;
    username: string;
    password: string;
}

export const getToken = async (auth: VaultAuthJSON): Promise<Object> => {
    const loginCredRes: any = await f(`${auth.vaultEndpoint}/v1/auth/userpass/login/${auth.username}`, {
        method: "POST",
        body: JSON.stringify({
            password: auth.password
        })
    }).catch(e => {
        e = e.toString();
        e = e.substring(e.indexOf(":") + 2);
        return { error: e };
    });

    if (loginCredRes.error) return loginCredRes;

    return await loginCredRes.json();
};

export const getKey = async ({ endpoint, token, key }: { endpoint: string; token: string; key: string }) => {
    const res = await f(endpoint + `/v1/pektin-kv/data/${key}`, {
        headers: {
            "X-Vault-Token": token
        }
    });
    const resJson = await res.json();
    return resJson?.data?.data;
};