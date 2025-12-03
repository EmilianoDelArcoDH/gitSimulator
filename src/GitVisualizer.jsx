// src/GitVisualizer.jsx
import React, { useEffect, useState } from "react";
import * as git from "isomorphic-git";
import { fs, REPO_DIR } from "./gitFs";
import { getRemoteData } from "./githubSim";
import { gitCurrentBranchName } from "./gitService";

export function GitVisualizer() {
    const [localCommits, setLocalCommits] = useState([]);
    const [remoteCommits, setRemoteCommits] = useState([]);
    const [remoteInfo, setRemoteInfo] = useState(null);
    const [currentBranch, setCurrentBranch] = useState("main");
    const [error, setError] = useState("");

    async function loadData() {
        setError("");
        try {
            const name = await gitCurrentBranchName();
            setCurrentBranch(name);
        } catch {
            setCurrentBranch("HEAD");
        }

        // Local log
        try {
            // Intentamos con HEAD, que apunta a la rama actual,
            // sin importar si se llama main o master.
            const log = await git.log({ fs, dir: REPO_DIR, ref: "HEAD" });

            const mapped = log.map((entry) => {
                const date = new Date(entry.commit.author.timestamp * 1000);
                return {
                    oid: entry.oid,
                    message: entry.commit.message,
                    author: entry.commit.author.name,
                    date: date.toLocaleString(),
                };
            });

            setLocalCommits(mapped);
        } catch (e) {
            // Si no hay commits todavía, no pasa nada.
            setLocalCommits([]);
        }


        // Remote
        const remote = getRemoteData();
        if (!remote) {
            setRemoteInfo(null);
            setRemoteCommits([]);
        } else {
            setRemoteInfo({
                name: remote.name,
                url: remote.url,
                defaultBranch: remote.defaultBranch,
                lastPushedBranch: remote.lastPushedBranch,
            });
            const mapped = (remote.commits || []).map((c) => {
                const date = new Date(c.timestamp * 1000);
                return {
                    oid: c.oid,
                    message: c.message,
                    author: c.author,
                    date: date.toLocaleString(),
                };
            });
            setRemoteCommits(mapped);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div
            style={{
                background: "#0f172a",
                color: "#e5e7eb",
                borderRadius: "8px",
                padding: "12px",
                height: "400px",
                display: "flex",
                flexDirection: "column",
                fontFamily: "system-ui, sans-serif",
            }}
        >
            <div style={{ display: "flex", marginBottom: "8px" }}>
                <h2 style={{ margin: 0, fontSize: "16px", flex: 1 }}>
                    Visualizador Git / GitHub simulado
                </h2>
                <button
                    onClick={loadData}
                    style={{
                        background: "#22c55e",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "12px",
                    }}
                >
                    Refrescar
                </button>
            </div>

            {error && (
                <div style={{ color: "#f97316", marginBottom: "8px" }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: "8px", flex: 1, overflow: "hidden" }}>
                {/* Local */}
                <div
                    style={{
                        flex: 1,
                        borderRight: "1px solid #1f2937",
                        paddingRight: "8px",
                        overflowY: "auto",
                    }}
                >
                    <h3 style={{ marginTop: 0, fontSize: "14px" }}>
                        Repo local ({currentBranch})
                    </h3>

                    {localCommits.length === 0 ? (
                        <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                            Sin commits aún. Creá uno con:
                            <br />
                            <code>git commit -m "mensaje"</code>
                        </p>
                    ) : (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {localCommits.map((c) => (
                                <li
                                    key={c.oid}
                                    style={{
                                        marginBottom: "8px",
                                        padding: "6px",
                                        background: "#020617",
                                        borderRadius: "4px",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "monospace",
                                            fontSize: "12px",
                                            color: "#38bdf8",
                                        }}
                                    >
                                        {c.oid.slice(0, 7)}
                                    </div>
                                    <div style={{ fontSize: "13px" }}>{c.message}</div>
                                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                                        {c.author} — {c.date}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Remote */}
                <div
                    style={{
                        flex: 1,
                        paddingLeft: "8px",
                        overflowY: "auto",
                    }}
                >
                    <h3 style={{ marginTop: 0, fontSize: "14px" }}>GitHub simulado</h3>

                    {!remoteInfo ? (
                        <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                            No hay remoto todavía.
                            <br />
                            Creá uno con:
                            <br />
                            <code>github create mi-repo</code>
                        </p>
                    ) : (
                        <>
                            <p style={{ fontSize: "12px", marginBottom: "4px" }}>
                                <strong>Repo:</strong> {remoteInfo.name}
                                <br />
                                <strong>URL:</strong> {remoteInfo.url}
                                <br />
                                <strong>Rama por defecto:</strong> {remoteInfo.defaultBranch}
                                <br />
                                <strong>Última rama pusheada:</strong>{" "}
                                {remoteInfo.lastPushedBranch || "(ninguna)"}
                            </p>
                            {remoteCommits.length === 0 ? (
                                <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                                    Sin commits remotos.
                                    <br />
                                    Probá:
                                    <br />
                                    <code>git push origin main</code>
                                </p>
                            ) : (
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {remoteCommits.map((c) => (
                                        <li
                                            key={c.oid}
                                            style={{
                                                marginBottom: "8px",
                                                padding: "6px",
                                                background: "#020617",
                                                borderRadius: "4px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontFamily: "monospace",
                                                    fontSize: "12px",
                                                    color: "#22c55e",
                                                }}
                                            >
                                                {c.oid.slice(0, 7)}
                                            </div>
                                            <div style={{ fontSize: "13px" }}>{c.message}</div>
                                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                                                {c.author} — {c.date}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
