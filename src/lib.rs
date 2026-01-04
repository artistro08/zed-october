use zed_extension_api::{self as zed, Result};

struct OctoberExtension;

impl zed::Extension for OctoberExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        // October CMS doesn't have a dedicated language server yet
        // This could be extended to support a custom LSP in the future
        // For now, we just provide syntax highlighting via tree-sitter
        Ok(zed::Command {
            command: "".to_string(),
            args: vec![],
            env: Default::default(),
        })
    }
}

zed::register_extension!(OctoberExtension);
