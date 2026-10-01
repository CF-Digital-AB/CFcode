# OpenCode and hosted API providers

Install and authenticate OpenCode on the machine running your environment, then
enable it in **Settings > Providers**. See [provider setup](./install.md#providers).
CF Code requires OpenCode 1.14.19 or newer, including when you connect an existing
OpenCode server.

## Z.ai and DeepSeek

For a locally managed OpenCode instance, choose an API provider in **Settings →
Providers → OpenCode → API provider**. CF Code includes presets for **Z.ai Coding
Plan Global** and **DeepSeek**, plus a custom OpenAI-compatible API.

Enter the API key when creating the instance, or replace it later in the API
provider section. Keys are stored separately from normal settings and are only
injected into the selected environment. Set **Server URL** empty so CF Code can
apply the profile to the local OpenCode process; an external OpenCode server must
be configured with its own provider settings.

The preset endpoint and model can be overridden. Refresh provider status after
changing the API provider, endpoint, model, or key. If a model is not listed,
add it under **Models** using the exact model id reported by the provider.

## Local or external server

Leave **Server URL** empty to let CF Code start OpenCode locally. A password in
provider settings applies to both that server and CF Code's connection. With no
password setting, the local server uses `OPENCODE_SERVER_PASSWORD` from its
environment.

To use an existing OpenCode server, set **Server URL** and its password in provider
settings. CF Code uses only that configured password for an external server; it
does not forward a local `OPENCODE_SERVER_PASSWORD`. If connection or version checks
fail, check the URL, credentials, and OpenCode version, then refresh provider status.

After a lost connection, send another prompt to reconnect to the same OpenCode
session.

## Approvals

OpenCode follows the shared [permission modes](./permission-modes.md). **Auto** has
the same rules as **Supervised** because OpenCode has no AI approval reviewer.
Environment files such as `.env` and `.env.local` need approval in restricted
modes even though normal file reads do not; `.env.example` is allowed.

**Allow for workspace** applies to matching requests in other OpenCode sessions
using the same workspace. It is broader than the current thread, especially on a
shared external server. Use **Allow once** for a single request. Denying an action
does not stop the whole turn.

## Refresh models, commands, and skills

After changing an OpenCode login or configuration, use **Refresh provider status**
in **Settings > Providers** for that environment. On mobile, use **Refresh models**
in the thread settings. Reconnecting also refreshes the catalog; periodic provider
health checks do not.

Credential changes are read on refresh. Native OpenCode configuration can remain
cached while the local helper is running. Let it sit for 30 seconds without model
refreshes or text-generation work, then refresh again to reload the files. Repeated
refreshes keep the helper alive. An external server may need its own reload or
restart before CF Code can see configuration changes.

Existing threads keep their selected model and options even when it disappears
from the catalog. If OpenCode rejects that model, select an available one and retry.
