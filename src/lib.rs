use zed_extension_api::{self as zed, Result};

struct OctoberExtension;

impl zed::Extension for OctoberExtension {
    fn new() -> Self {
        Self
    }

    fn language_server_command(
        &mut self,
        _language_server_id: &zed::LanguageServerId,
        _worktree: &zed::Worktree,
    ) -> Result<zed::Command> {
        // No language server for now - just syntax highlighting
        Err("No language server configured for October CMS".into())
    }
}

zed::register_extension!(OctoberExtension);
