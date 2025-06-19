export async function aceLoader() {
  const ace = await import("ace-builds");

  await Promise.all([
    import("ace-builds/src-noconflict/mode-javascript"),
    import("ace-builds/src-noconflict/theme-cloud_editor"),
    import("ace-builds/src-noconflict/theme-cloud_editor_dark"),
    import("ace-builds/src-noconflict/ext-language_tools"),
  ]);

  ace.config.set(
    "basePath",
    "ace-builds/src-noconflict/ext-inline_autocomplete"
  );

  return ace;
}
