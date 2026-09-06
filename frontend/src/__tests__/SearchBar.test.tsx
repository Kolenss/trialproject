import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchBar from "@/components/SearchBar";
import { I18nProvider } from "@/i18n/context";

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

describe("SearchBar", () => {
  it("renders search input and button", () => {
    renderWithI18n(<SearchBar onSearch={() => {}} isLoading={false} />);
    expect(screen.getByPlaceholderText("Search for a product...")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  it("calls onSearch with the query when submitted", () => {
    const onSearch = vi.fn();
    renderWithI18n(<SearchBar onSearch={onSearch} isLoading={false} />);

    const input = screen.getByPlaceholderText("Search for a product...");
    fireEvent.change(input, { target: { value: "nutella" } });
    fireEvent.submit(input.closest("form")!);

    expect(onSearch).toHaveBeenCalledWith("nutella");
  });

  it("does not submit an empty query", () => {
    const onSearch = vi.fn();
    renderWithI18n(<SearchBar onSearch={onSearch} isLoading={false} />);

    const input = screen.getByPlaceholderText("Search for a product...");
    fireEvent.submit(input.closest("form")!);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("disables input and button when loading", () => {
    renderWithI18n(<SearchBar onSearch={() => {}} isLoading={true} />);
    expect(screen.getByPlaceholderText("Search for a product...")).toBeDisabled();
    expect(screen.getByText("Loading...")).toBeDisabled();
  });
});
