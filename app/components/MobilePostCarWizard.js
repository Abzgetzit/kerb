"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const stepDetails = [
  { title: "Vehicle", text: "Car details and price" },
  { title: "Photos", text: "Features, description and images" },
  { title: "Selling", text: "Seller details and listing type" },
  { title: "Finish", text: "Boost, terms and submit" },
];

function addStyles() {
  if (document.getElementById("kerb-mobile-post-wizard-styles")) return;

  const style = document.createElement("style");
  style.id = "kerb-mobile-post-wizard-styles";
  style.textContent = `
    .kerbMobilePostWizardTop,.kerbMobilePostWizardBar{display:none}
    @media(max-width:720px){
      body.kerbMobilePostMode{background:#f7f9fd!important}
      body.kerbMobilePostMode main.page{padding:0 12px calc(96px + env(safe-area-inset-bottom))!important;background:#f7f9fd!important}
      body.kerbMobilePostMode main.page>.hero{display:none!important}
      body.kerbMobilePostMode main.page>.navbar{min-height:58px!important;margin:0 -12px 8px!important;padding:8px 14px!important;position:sticky!important;top:0!important;z-index:160!important;background:rgba(255,255,255,.96)!important;border-bottom:1px solid #e4eaf5!important;backdrop-filter:blur(14px)!important;align-items:center!important}
      body.kerbMobilePostMode main.page>.navbar .logo{font-size:30px!important}
      body.kerbMobilePostMode .formSection{margin-top:0!important}
      body.kerbMobilePostMode form.formCard{padding:0 0 18px!important;border-radius:18px!important;box-shadow:none!important;overflow:visible!important;background:transparent!important;border:0!important}
      body.kerbMobilePostMode form.kerbMobileWizardReady>.formHeader,
      body.kerbMobilePostMode form.kerbMobileWizardReady>[data-mobile-step]{display:none!important}
      body.kerbMobilePostMode form.kerbMobileWizardReady>[data-mobile-step].kerbMobileStepVisible{display:block!important}
      body.kerbMobilePostMode form.kerbMobileWizardReady>.grid.kerbMobileStepVisible{display:grid!important}
      body.kerbMobilePostMode form.kerbMobileWizardReady>.formHeader.kerbMobileStepVisible{display:flex!important}
      body.kerbMobilePostMode form.kerbMobileWizardReady>.primaryBtn.kerbMobileStepVisible{display:none!important}
      body.kerbMobilePostMode form.kerbMobileWizardReady>.kerbMobilePostWizardTop{display:block!important}
      .kerbMobilePostWizardTop{position:sticky;top:66px;z-index:150;background:#f7f9fd;padding:8px 0 10px;margin-bottom:2px}
      .kerbMobilePostWizardTitle{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px;padding:0 2px}
      .kerbMobilePostWizardTitle div{display:grid;gap:1px}
      .kerbMobilePostWizardTitle strong{font-size:21px;letter-spacing:-.5px;color:#071126}
      .kerbMobilePostWizardTitle span{font-size:11px;color:#68758c;font-weight:750}
      .kerbMobilePostWizardTitle b{font-size:11px;color:#0048ff;background:#eaf1ff;border:1px solid #d7e4ff;border-radius:999px;padding:6px 9px}
      .kerbMobilePostSteps{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
      .kerbMobilePostStep{min-width:0;border:1px solid #dde6f3;border-radius:11px;background:#fff;padding:7px 3px;display:grid;place-items:center;gap:3px;color:#67748a}
      .kerbMobilePostStep span{width:24px;height:24px;border-radius:999px;background:#eff3f9;display:grid;place-items:center;font-size:11px;font-weight:950}
      .kerbMobilePostStep strong{font-size:9px;white-space:nowrap}
      .kerbMobilePostStep.active{border-color:#0048ff;background:#edf4ff;color:#0048ff}
      .kerbMobilePostStep.active span{background:#0048ff;color:#fff}
      body.kerbMobilePostMode form.formCard>.grid,
      body.kerbMobilePostMode form.formCard>.infoBox,
      body.kerbMobilePostMode form.formCard>.valuationBox,
      body.kerbMobilePostMode form.formCard>.featuresSection,
      body.kerbMobilePostMode form.formCard>.photoSection,
      body.kerbMobilePostMode form.formCard>.sellerSection,
      body.kerbMobilePostMode form.formCard>.privacySection,
      body.kerbMobilePostMode form.formCard>.kerbListingTypeSection,
      body.kerbMobilePostMode form.formCard>.boostPreviewSection,
      body.kerbMobilePostMode form.formCard>.termsSection,
      body.kerbMobilePostMode form.formCard>.errorBox,
      body.kerbMobilePostMode form.formCard>label:has(textarea){background:#fff;border:1px solid #e3e9f3;border-radius:17px;padding:14px;margin-bottom:10px!important}
      body.kerbMobilePostMode form.formCard>.grid,
      body.kerbMobilePostMode form.formCard>.infoBox,
      body.kerbMobilePostMode form.formCard>.valuationBox,
      body.kerbMobilePostMode form.formCard>.featuresSection,
      body.kerbMobilePostMode form.formCard>.photoSection,
      body.kerbMobilePostMode form.formCard>.sellerSection,
      body.kerbMobilePostMode form.formCard>.privacySection,
      body.kerbMobilePostMode form.formCard>.kerbListingTypeSection,
      body.kerbMobilePostMode form.formCard>.boostPreviewSection,
      body.kerbMobilePostMode form.formCard>.termsSection{background:#fff!important;border:1px solid #e3e9f3!important;border-radius:17px!important;padding:14px!important;margin:0 0 10px!important;box-shadow:0 7px 20px rgba(20,35,70,.035)!important}
      body.kerbMobilePostMode form.formCard>.grid{grid-template-columns:1fr!important;gap:11px!important}
      body.kerbMobilePostMode form.formCard label{font-size:12px!important;gap:6px!important}
      body.kerbMobilePostMode form.formCard input,
      body.kerbMobilePostMode form.formCard select,
      body.kerbMobilePostMode form.formCard textarea{border-radius:12px!important;padding:12px 13px!important;font-size:14px!important;background:#fbfcff!important}
      body.kerbMobilePostMode form.formCard textarea{min-height:105px!important;margin:0!important}
      body.kerbMobilePostMode form.formCard h2{font-size:22px!important;letter-spacing:-.5px!important}
      body.kerbMobilePostMode form.formCard p{font-size:12px!important;line-height:1.45!important}
      body.kerbMobilePostMode .featureChecklist{grid-template-columns:1fr 1fr!important;gap:7px!important;margin:12px 0 0!important}
      body.kerbMobilePostMode .featureOption{border-radius:12px!important;padding:9px!important;min-height:42px!important}
      body.kerbMobilePostMode .featureOption span{font-size:11px!important}
      body.kerbMobilePostMode .uploadBox{min-height:118px!important;border-radius:16px!important;padding:15px!important;margin-top:12px!important}
      body.kerbMobilePostMode .uploadBox strong{font-size:15px!important}
      body.kerbMobilePostMode .uploadBox small{font-size:10px!important}
      body.kerbMobilePostMode .photoGrid{grid-template-columns:repeat(2,1fr)!important;gap:8px!important;margin-top:10px!important}
      body.kerbMobilePostMode .privacySection,
      body.kerbMobilePostMode .boostPreviewSection{display:block!important}
      body.kerbMobilePostMode .privacyOptions,
      body.kerbMobilePostMode .boostChoiceGrid{gap:8px!important;margin-top:12px!important}
      body.kerbMobilePostMode .privacyOption,
      body.kerbMobilePostMode .termsOption,
      body.kerbMobilePostMode .boostChoice{border-radius:13px!important;padding:11px!important}
      body.kerbMobilePostMode .privacyOption em,
      body.kerbMobilePostMode .termsOption em,
      body.kerbMobilePostMode .boostChoice em{font-size:10px!important;line-height:1.35!important}
      body.kerbMobilePostMode .boostBenefits{display:none!important}
      body.kerbMobilePostMode .boostChoice{grid-template-columns:24px 1fr auto!important;gap:9px!important}
      body.kerbMobilePostMode .boostChoice b{font-size:13px!important}
      body.kerbMobilePostMode .termsOption strong{font-size:13px!important}
      body.kerbMobilePostMode .termsOption a{font-size:12px!important}
      body.kerbMobilePostMode .errorBox{font-size:12px!important;margin:0 0 10px!important}
      .kerbMobilePostWizardBar{display:grid;grid-template-columns:92px 1fr;gap:9px;position:fixed;left:0;right:0;bottom:0;z-index:250;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:rgba(255,255,255,.97);border-top:1px solid #dfe6f1;box-shadow:0 -12px 30px rgba(10,20,40,.08);backdrop-filter:blur(16px)}
      .kerbMobilePostWizardBar button{height:48px;border-radius:13px;font-family:inherit;font-size:14px;font-weight:950}
      .kerbMobilePostBack{border:1px solid #dce5f3;background:#fff;color:#24314a}
      .kerbMobilePostNext{border:0;background:#0048ff;color:#fff;box-shadow:0 8px 20px rgba(0,72,255,.18)}
      .kerbMobilePostBack:disabled{opacity:.4}
      .kerbMobilePostWizardBar.working .kerbMobilePostNext{opacity:.6;pointer-events:none}
    }
  `;
  document.head.appendChild(style);
}

function getStepForChild(child) {
  if (!child || child.classList?.contains("kerbMobilePostWizardTop")) return 0;

  if (
    child.classList?.contains("formHeader") ||
    child.classList?.contains("grid") ||
    child.classList?.contains("infoBox") ||
    child.classList?.contains("valuationBox") ||
    child.matches?.('input[type="hidden"]')
  ) return 1;

  if (
    child.classList?.contains("featuresSection") ||
    child.classList?.contains("photoSection") ||
    child.querySelector?.('textarea[name="description"]')
  ) return 2;

  if (
    child.classList?.contains("sellerSection") ||
    child.classList?.contains("privacySection") ||
    child.classList?.contains("kerbListingTypeSection") ||
    child.id === "kerb-accept-bids"
  ) return 3;

  if (
    child.classList?.contains("boostPreviewSection") ||
    child.classList?.contains("termsSection") ||
    child.classList?.contains("errorBox") ||
    child.classList?.contains("primaryBtn")
  ) return 4;

  return 2;
}

function installWizard() {
  if (window.location.pathname !== "/post-car") return null;
  if (!window.matchMedia("(max-width: 720px)").matches) return null;

  const form = document.querySelector("form.formCard");
  if (!form) return null;
  if (form.dataset.mobileWizardInstalled === "true") return form.__kerbWizardCleanup || null;

  form.dataset.mobileWizardInstalled = "true";
  form.classList.add("kerbMobileWizardReady");
  document.body.classList.add("kerbMobilePostMode");

  let currentStep = 1;

  const top = document.createElement("div");
  top.className = "kerbMobilePostWizardTop";
  top.innerHTML = `
    <div class="kerbMobilePostWizardTitle">
      <div><strong>New vehicle listing</strong><span>${stepDetails[0].text}</span></div>
      <b>Step 1 of 4</b>
    </div>
    <div class="kerbMobilePostSteps">
      ${stepDetails.map((step, index) => `<button type="button" class="kerbMobilePostStep${index === 0 ? " active" : ""}" data-step="${index + 1}"><span>${index + 1}</span><strong>${step.title}</strong></button>`).join("")}
    </div>
  `;
  form.prepend(top);

  const bar = document.createElement("div");
  bar.className = "kerbMobilePostWizardBar";
  bar.innerHTML = `
    <button type="button" class="kerbMobilePostBack" disabled>Back</button>
    <button type="button" class="kerbMobilePostNext">Next</button>
  `;
  document.body.appendChild(bar);

  const backButton = bar.querySelector(".kerbMobilePostBack");
  const nextButton = bar.querySelector(".kerbMobilePostNext");
  const originalSubmit = form.querySelector('button[type="submit"].primaryBtn');

  function classifyChildren() {
    [...form.children].forEach((child) => {
      if (child === top) return;
      child.dataset.mobileStep = String(getStepForChild(child));
    });
  }

  function renderStep() {
    classifyChildren();
    [...form.querySelectorAll(":scope > [data-mobile-step]")].forEach((child) => {
      child.classList.toggle("kerbMobileStepVisible", child.dataset.mobileStep === String(currentStep));
    });

    [...top.querySelectorAll(".kerbMobilePostStep")].forEach((button) => {
      button.classList.toggle("active", Number(button.dataset.step) === currentStep);
    });

    const detail = stepDetails[currentStep - 1];
    top.querySelector(".kerbMobilePostWizardTitle span").textContent = detail.text;
    top.querySelector(".kerbMobilePostWizardTitle b").textContent = `Step ${currentStep} of 4`;
    backButton.disabled = currentStep === 1;
    nextButton.textContent = currentStep === 4 ? "Submit listing" : "Next";
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function fieldsForStep(step) {
    return [...form.querySelectorAll(`:scope > [data-mobile-step="${step}"] input, :scope > [data-mobile-step="${step}"] select, :scope > [data-mobile-step="${step}"] textarea`)]
      .filter((field) => !field.disabled && field.type !== "hidden");
  }

  function validateStep(step) {
    const invalid = fieldsForStep(step).find((field) => !field.checkValidity());
    if (!invalid) return true;
    invalid.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => invalid.reportValidity(), 180);
    return false;
  }

  function goToStep(step) {
    const target = Math.max(1, Math.min(4, Number(step) || 1));
    if (target > currentStep && !validateStep(currentStep)) return;
    currentStep = target;
    renderStep();
  }

  function handleFinalSubmit() {
    const allFields = [...form.elements].filter((field) => field?.checkValidity && !field.disabled);
    const invalid = allFields.find((field) => !field.checkValidity());

    if (invalid) {
      const directChild = invalid.closest("[data-mobile-step]");
      currentStep = Number(directChild?.dataset.mobileStep || 1);
      renderStep();
      window.setTimeout(() => {
        invalid.scrollIntoView({ behavior: "smooth", block: "center" });
        invalid.reportValidity();
      }, 180);
      return;
    }

    bar.classList.add("working");
    nextButton.textContent = "Submitting…";
    originalSubmit?.click();
    window.setTimeout(() => bar.classList.remove("working"), 5000);
  }

  const stepClick = (event) => {
    const button = event.target.closest(".kerbMobilePostStep");
    if (button) goToStep(button.dataset.step);
  };
  const backClick = () => goToStep(currentStep - 1);
  const nextClick = () => {
    if (currentStep < 4) {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
      return;
    }
    handleFinalSubmit();
  };

  top.addEventListener("click", stepClick);
  backButton.addEventListener("click", backClick);
  nextButton.addEventListener("click", nextClick);

  const observer = new MutationObserver(() => {
    classifyChildren();
    [...form.querySelectorAll(":scope > [data-mobile-step]")].forEach((child) => {
      child.classList.toggle("kerbMobileStepVisible", child.dataset.mobileStep === String(currentStep));
    });
  });
  observer.observe(form, { childList: true });

  renderStep();

  const cleanup = () => {
    observer.disconnect();
    top.removeEventListener("click", stepClick);
    backButton.removeEventListener("click", backClick);
    nextButton.removeEventListener("click", nextClick);
    top.remove();
    bar.remove();
    form.classList.remove("kerbMobileWizardReady");
    delete form.dataset.mobileWizardInstalled;
    [...form.querySelectorAll(":scope > [data-mobile-step]")].forEach((child) => {
      child.classList.remove("kerbMobileStepVisible");
      delete child.dataset.mobileStep;
    });
    document.body.classList.remove("kerbMobilePostMode");
  };

  form.__kerbWizardCleanup = cleanup;
  return cleanup;
}

export default function MobilePostCarWizard() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/post-car") return undefined;
    addStyles();

    let cleanup = null;
    let timer;
    const media = window.matchMedia("(max-width: 720px)");

    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!media.matches) {
          cleanup?.();
          cleanup = null;
          return;
        }
        cleanup = installWizard() || cleanup;
      }, 100);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    media.addEventListener?.("change", schedule);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      media.removeEventListener?.("change", schedule);
      cleanup?.();
      document.body.classList.remove("kerbMobilePostMode");
    };
  }, [pathname]);

  return null;
}
