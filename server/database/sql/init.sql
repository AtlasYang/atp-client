CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    name TEXT,
    status TEXT,
    tool_status TEXT,
    assigned_tool_id UUID,
    created_at TIMESTAMP
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    role TEXT,
    message TEXT,
    created_at TIMESTAMP,
    message_type INTEGER,
    linked_tool_id UUID,

    CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- deprecated
-- CREATE TABLE tools (
--     id UUID PRIMARY KEY,
--     name TEXT,
--     version TEXT,
--     description TEXT,
--     provider_interface TEXT,
--     created_at TIMESTAMP
-- );

-- deprecated
-- CREATE TABLE tool_messages (
--     id UUID PRIMARY KEY,
--     session_id UUID NOT NULL,
--     tool_id UUID,
--     role TEXT,
--     data TEXT,
--     created_at TIMESTAMP,
--     CONSTRAINT fk_session_tool FOREIGN KEY (session_id) REFERENCES sessions(id)
-- );

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at_asc ON chat_messages(session_id, created_at ASC);