import "./index.css";

const showConfiguredTrial = async () => {
  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-trial-copy]"));
  if (!targets.length) return;

  try {
    const response = await fetch("/api/billing-config");
    if (!response.ok) return;

    const data = await response.json();
    const trialDays = Number(data?.trialDays || 0);
    if (!Number.isInteger(trialDays) || trialDays < 1) return;

    targets.forEach((target) => {
      const template =
        target.dataset.template ||
        target.dataset.templateEn ||
        "{days}-day free trial. No card required during trial.";
      target.textContent = template.replace("{days}", String(trialDays));
      target.classList.remove("hidden");
    });
  } catch {
    // Static pages stay valid when the billing config endpoint is unavailable.
  }
};

void showConfiguredTrial();
