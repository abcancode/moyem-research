import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  MessageSquareText,
  Moon,
  Sun,
} from "lucide-react";
import moyemLogo from "./assets/images/moyem-logo.png";
import moyemLogoLight from "./assets/images/moyem-logo-light.png";
import { supabase } from "./lib/supabase";

const questions = [
  {
    title: "What best describes your role?",
    subtitle: "Tell us a little about your work.",
    options: [
      "Business owner",
      "Founder / Co-founder",
      "Manager / Executive",
      "Employee",
      "Other",
    ],
    type: "single",
  },
  {
    title: "What industry are you in?",
    subtitle: "Choose the industry that best describes your business.",
    options: [
      "Technology",
      "Retail / E-commerce",
      "Professional services",
      "Finance / Accounting",
      "Manufacturing",
      "Healthcare",
      "Education",
      "Other",
    ],
    type: "single",
  },
  {
    title: "How large is your business?",
    subtitle: "An approximate size is perfectly fine.",
    options: [
      "Just me",
      "2–5 employees",
      "6–20 employees",
      "21–50 employees",
      "51–200 employees",
      "More than 200 employees",
      "Planning to start",
    ],
    type: "single",
  },
  {
    title: "What are your biggest day-to-day challenges?",
    subtitle: "Select all that apply.",
    options: [
      "Managing customers",
      "Tracking sales and revenue",
      "Managing finances and invoices",
      "Keeping track of inventory",
      "Coordinating projects and tasks",
      "Managing employees and teams",
      "Getting useful business insights",
      "Using too many disconnected tools",
      "Other",
    ],
    type: "multiple",
  },
  {
    title: "How do you currently manage your business?",
    subtitle: "Select all the tools or methods you use.",
    options: [
      "Spreadsheets",
      "Accounting software",
      "CRM software",
      "Multiple separate applications",
      "Paper or manual processes",
      "Custom-built software",
      "Other",
    ],
    type: "multiple",
  },
  {
    title: "Which features would be most useful to you?",
    subtitle: "Choose up to three priorities.",
    options: [
      "Customer and relationship management",
      "Sales and quotations",
      "Finance and invoicing",
      "Inventory management",
      "Project and team management",
      "Reports and business analytics",
      "AI-powered insights and recommendations",
      "Website creation and management",
    ],
    type: "multiple",
    max: 3,
  },
  {
    title:
      "Would you consider trying a platform that brings these tools together?",
    subtitle: "There is no right or wrong answer.",
    options: [
      "Yes, definitely",
      "Maybe, depending on the features",
      "Maybe, depending on the price",
      "Not at this time",
    ],
    type: "single",
  },
];

type Answer = string | string[];

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("moyem-theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [country, setCountry] = useState("");
  const [comment, setComment] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("moyem-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const question = questions[step];
  const currentAnswer =
    answers[step] ?? (question?.type === "multiple" ? [] : "");
  const progress = ((step + 1) / questions.length) * 100;

  const selectOption = (option: string) => {
    if (!question) return;

    const next = [...answers];

    if (question.type === "multiple") {
      const selected = Array.isArray(currentAnswer) ? currentAnswer : [];
      const exists = selected.includes(option);

      if (!exists && question.max && selected.length >= question.max) {
        return;
      }

      next[step] = exists
        ? selected.filter((item) => item !== option)
        : [...selected, option];
    } else {
      next[step] = option;
    }

    setAnswers(next);
  };

  const canContinue = Array.isArray(currentAnswer)
    ? currentAnswer.length > 0
    : currentAnswer.trim().length > 0;

  const submitSurvey = async () => {
    if (contactConsent && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const response = {
      answers: Object.fromEntries(
        questions.map((item, index) => [item.title, answers[index] ?? []]),
      ),
      business_name: businessName.trim() || null,
      country: country.trim() || null,
      comment: comment.trim() || null,
      email: contactConsent ? email.trim().toLowerCase() : null,
      contact_consent: contactConsent,
    };

    try {
      const { error } = await supabase
        .from("moyem_research_responses")
        .insert(response);

      if (error) {
        console.error("Supabase submission error:", error);
        setSubmitError("We could not submit your responses. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Unexpected submission error:", error);
      setSubmitError(
        "Something went wrong. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const themeToggle = (
    <button
      type="button"
      onClick={() => setDarkMode((current) => !current)}
      aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
      title={`Switch to ${darkMode ? "light" : "dark"} mode`}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );

  const header = (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
      <a href="#" aria-label="Moyem home" className="inline-flex items-center">
        <img
          src={darkMode ? moyemLogoLight : moyemLogo}
          alt="Moyem"
          className="h-11 w-auto max-w-[180px] object-contain"
        />
      </a>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex sm:text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Research & Early Access
        </span>
        {themeToggle}
      </div>
    </header>
  );

  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col bg-slate-50 px-5 py-6 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
        {header}

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm sm:p-12 dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 size={34} />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400">
              Moyem Research
            </p>

            <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Thank you for sharing!
            </h1>

            <p className="mb-8 leading-7 text-slate-600 dark:text-slate-300">
              Your feedback will help us understand the real needs of businesses
              and shape what Moyem becomes.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-[#0f387d] px-6 py-3 font-semibold text-white transition hover:bg-blue-900"
            >
              Back to the beginning
            </button>
          </div>
        </div>

        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          © {new Date().getFullYear()} Moyem. Helping businesses work better.
        </footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {header}

      {!started ? (
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 md:grid-cols-2 md:pt-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-[#0f387d] dark:bg-blue-950/60 dark:text-blue-300">
              Help shape the future of business
            </div>

            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              Let's make running a business{" "}
              <span className="text-[#416bff]">simpler.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-300">
              We're exploring a simpler way for businesses to manage their daily
              operations. Share your experience and help us shape Moyem around
              the needs of real businesses.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setStarted(true)}
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#0f387d] px-6 py-4 font-semibold text-white shadow-lg shadow-blue-900/10 transition hover:-translate-y-0.5 hover:bg-blue-900"
              >
                Take the 3-minute survey
                <ArrowRight size={18} />
              </button>

              <span className="text-sm text-slate-500 dark:text-slate-400">
                No account required
              </span>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Short and simple
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                Your feedback matters
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-5 rounded-[2rem] bg-blue-100/70 blur-2xl dark:bg-blue-900/20" />

            <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0f387d] dark:bg-blue-950 dark:text-blue-300">
                  <ClipboardList size={24} />
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  3 minutes
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Your business. Your experience.
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                A few questions about how you work, the challenges you face, and
                what would make business management easier.
              </p>

              <div className="mt-7 space-y-4">
                {[
                  ["Your business", "A little about you and your work"],
                  ["Your challenges", "What takes time or causes friction"],
                  ["Your priorities", "What tools and support you need"],
                ].map(([title, description], index) => (
                  <div
                    key={title}
                    className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#0f387d] shadow-sm dark:bg-slate-700 dark:text-blue-300">
                      {index + 1}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <MessageSquareText
                  size={18}
                  className="shrink-0 text-[#416bff]"
                />
                Help us build around real business needs.
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mx-auto w-full max-w-2xl px-5 pb-20 pt-8 sm:px-8">
          <div className="mb-8">
            <button
              type="button"
              onClick={() =>
                step === 0 ? setStarted(false) : setStep(step - 1)
              }
              className="mb-6 text-sm font-medium text-slate-500 transition hover:text-[#0f387d] dark:text-slate-400 dark:hover:text-blue-300"
            >
              ← Back
            </button>

            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-[#0f387d] dark:text-blue-300">
                Your business survey
              </span>

              <span className="text-slate-500 dark:text-slate-400">
                Question {step + 1} of {questions.length}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-[#416bff] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-7">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#416bff]">
                Question {step + 1}
              </p>

              <h1 className="text-2xl font-bold leading-snug tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                {question.title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
                {question.subtitle}
              </p>
            </div>

            <div className="space-y-3">
              {question.options.map((option) => {
                const selected = Array.isArray(currentAnswer)
                  ? currentAnswer.includes(option)
                  : currentAnswer === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectOption(option)}
                    aria-pressed={selected}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-[#416bff] bg-blue-50 text-[#0f387d] dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="pr-3 text-sm font-medium sm:text-base">
                      {option}
                    </span>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-[#416bff] bg-[#416bff] text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {selected && <CheckCircle2 size={14} />}
                    </span>
                  </button>
                );
              })}
            </div>

            {question.type === "multiple" && (
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                {question.max
                  ? `Select up to ${question.max} options.`
                  : "Select all that apply."}
              </p>
            )}

            {step < questions.length - 1 && (
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep(step + 1)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f387d] px-6 py-3.5 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {started && step === questions.length - 1 && (
        <section className="mx-auto -mt-12 w-full max-w-2xl px-5 pb-20 sm:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              A little more (optional)
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              These details help us understand your context. You can leave them
              blank.
            </p>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Business name
                </span>
                <input
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Your business name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#416bff] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Country / region
                </span>
                <input
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder="e.g. Nigeria"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#416bff] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Anything else you'd like us to know?
                </span>
                <textarea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Share any other thoughts (optional)"
                  rows={3}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#416bff] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                />
              </label>

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={contactConsent}
                    onChange={(event) =>
                      setContactConsent(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-[#0f387d]"
                  />

                  <span className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    I'd like to hear about Moyem's early access or future
                    research. I understand my email will only be used for this
                    follow-up.
                  </span>
                </label>

                {contactConsent && (
                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Email address
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#416bff] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-950"
                    />
                  </label>
                )}
              </div>

              {submitError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300"
                >
                  {submitError}
                </p>
              )}

              <button
                type="button"
                onClick={submitSurvey}
                disabled={
                  submitting ||
                  (contactConsent && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f387d] px-6 py-4 font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? "Submitting..." : "Submit my feedback"}
                {!submitting && <ArrowRight size={18} />}
              </button>

              <p className="text-center text-xs leading-5 text-slate-400 dark:text-slate-500">
                Your responses are for Moyem's product research. Contact details
                are optional.
              </p>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        © {new Date().getFullYear()} Moyem. Making business simple.
      </footer>
    </main>
  );
}

export default App;
