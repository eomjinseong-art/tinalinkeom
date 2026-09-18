import { useState, type FormEvent } from "react";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xnpadyby";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (String(data.get("_gotcha") ?? "").trim()) {
      setStatus("success");
      form.reset();
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });

      if (response.ok) {
        form.reset();
        setStatus("success");
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; errors?: { message?: string }[] }
        | null;
      setErrorMessage(
        payload?.error ||
          payload?.errors?.[0]?.message ||
          "보내지 못했습니다. 잠시 후 다시 시도해 주세요.",
      );
      setStatus("error");
    } catch {
      setErrorMessage("보내지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setStatus("error");
    }
  }

  return (
    <section className="contact" aria-labelledby="contact-title">
      <h2 id="contact-title" className="section-title">
        문의하기
      </h2>
      {status === "success" ? (
        <p className="contact-success" role="status">
          보내 주셔서 감사합니다. 확인 후 답변드리겠습니다.
        </p>
      ) : (
        <>
          <p className="contact-lead">협업이나 문의는 아래 폼으로 보내 주세요.</p>
          <form
            className="contact-form"
            action={FORMSPREE_ENDPOINT}
            method="POST"
            onSubmit={onSubmit}
          >
            <input type="hidden" name="_subject" value="링크 허브 문의" />
            <label className="contact-honeypot" htmlFor="contact-gotcha">
              웹사이트
              <input id="contact-gotcha" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
            </label>
            <label className="contact-field" htmlFor="contact-name">
              이름
              <input id="contact-name" type="text" name="name" autoComplete="name" required />
            </label>
            <label className="contact-field" htmlFor="contact-email">
              회신 이메일
              <input
                id="contact-email"
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                required
              />
            </label>
            <label className="contact-field" htmlFor="contact-message">
              메시지
              <textarea id="contact-message" name="message" rows={4} required />
            </label>
            {status === "error" && (
              <p className="contact-error" role="alert">
                {errorMessage}
              </p>
            )}
            <button className="contact-submit" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "보내는 중…" : "문의하기"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
