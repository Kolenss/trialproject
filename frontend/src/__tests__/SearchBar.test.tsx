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

  it("calls onSearch with the query when button is clicked", () => {
    const onSearch = vi.fn();
    renderWithI18n(<SearchBar onSearch={onSearch} isLoading={false} />);

    const input = screen.getByPlaceholderText("Search for a product...");
    fireEvent.change(input, { target: { value: "nutella" } });
    fireEvent.click(screen.getByText("Search"));

    expect(onSearch).toHaveBeenCalledWith("nutella");
  });

  it("does not call onSearch when query is empty", () => {
    const onSearch = vi.fn();
    renderWithI18n(<SearchBar onSearch={onSearch} isLoading={false} />);

    fireEvent.click(screen.getByText("Search"));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("disables input and button when loading", () => {
    renderWithI18n(<SearchBar onSearch={() => {}} isLoading={true} />);
    expect(screen.getByPlaceholderText("Search for a product...")).toBeDisabled();
    expect(screen.getByText("Loading...")).toBeDisabled();
  });

  it("shows recent searches dropdown on focus", () => {
    const recentSearches = [
      { id: 1, query: "milk", language: "en", createdAt: "2026-09-01" },
      { id: 2, query: "bread", language: "en", createdAt: "2026-09-01" },
    ];
    renderWithI18n(
      <SearchBar onSearch={() => {}} isLoading={false} recentSearches={recentSearches} />
    );

    const input = screen.getByPlaceholderText("Search for a product...");
    fireEvent.focus(input);

    expect(screen.getByText("milk")).toBeInTheDocument();
    expect(screen.getByText("bread")).toBeInTheDocument();
  });

  it("calls onSearch when a recent search is clicked", () => {
    const onSearch = vi.fn();
    const recentSearches = [
      { id: 1, query: "chocolate", language: "en", createdAt: "2026-09-01" },
    ];
    renderWithI18n(
      <SearchBar onSearch={onSearch} isLoading={false} recentSearches={recentSearches} />
    );

    const input = screen.getByPlaceholderText("Search for a product...");
    fireEvent.focus(input);
    fireEvent.click(screen.getByText("chocolate"));

    expect(onSearch).toHaveBeenCalledWith("chocolate");
  });
});
