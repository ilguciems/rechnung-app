import { type RenderOptions, render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import Providers from "../app/providers";
import deMessages from "../messages/de.json";

export function renderWithIntl(ui: ReactElement, options?: RenderOptions) {
  return render(
    <NextIntlClientProvider locale="de" messages={deMessages}>
      <Providers>{ui}</Providers>
    </NextIntlClientProvider>,
    options,
  );
}
