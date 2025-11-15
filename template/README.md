# Linera buildathon submission template

This template provides a Docker container with all the necessary
dependencies to build and run a local Linera application against a
local network.

If you want to submit an app running against a local network, please
use this template.  If you have provided a link to a live demo running
against the testnet, you do not need to use this template (but it may
be helpful anyway!).

## Structure

The template provides a `Dockerfile` describing a container with all the
necessary dependencies for Linera backend and frontend development, as
well as a simple `compose.yaml` file for Docker Compose that mounts
the current directory at `/build` and exposes the following ports:

- 5173: the frontend of your application (optional)
- 8080: the Linera faucet
- 9001: the localnet validator's proxy
- 13001: the localnet validator itself

Please keep this port structure, and make sure the `Dockerfile` or the
`compose.yaml` defines a reasonable healthcheck for your app (the
default waits for your frontend to be served on `localhost:5173`).
Other internal structure is optional; feel free to change it.

## Usage

To get started, fill in `run.bash` with instructions to build and run
your backend and (if applicable) frontend.

To test that your submission works, run `docker compose up
--force-recreate` and access your application frontend at
`localhost:5173`.
