import { type EditorConfig } from "ckeditor5";

let configUpdateAlertShown = false;

export function configUpdateAlert(config: EditorConfig) {
  if (configUpdateAlertShown) {
    return;
  }

  const isModifiedByUser = (currentValue: unknown, forbiddenValue: string) => {
    if (currentValue === forbiddenValue) {
      return false;
    }
    if (currentValue === undefined) {
      return false;
    }
    return true;
  };

  const valuesToUpdate: string[] = [];
  configUpdateAlertShown = true;

  if (!isModifiedByUser(config.licenseKey, "<YOUR_LICENSE_KEY>")) {
    valuesToUpdate.push("LICENSE_KEY");
  }

  if (
    !isModifiedByUser(
      config.cloudServices?.tokenUrl,
      "<YOUR_CLOUD_SERVICES_TOKEN_URL>",
    )
  ) {
    valuesToUpdate.push("CLOUD_SERVICES_TOKEN_URL");
  }

  if (valuesToUpdate.length) {
    window.alert(
      [
        "Please update the following values in your editor config",
        "to receive full access to Premium Features:",
        "",
        ...valuesToUpdate.map((value) => ` - ${value}`),
      ].join("\n"),
    );
  }
}
