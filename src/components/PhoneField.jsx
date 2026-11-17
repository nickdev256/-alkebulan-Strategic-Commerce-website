import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { countries, pinnedCodes } from '../data/countries.js';
import './PhoneField.css';

const byCode = Object.fromEntries(countries.map((c) => [c.code, c]));
const pinned = pinnedCodes.map((code) => byCode[code]);

const flagUrl = (code) => `https://flagcdn.com/${code}.svg`;

/*
 * Phone number with a country-code picker (flag + dialling code).
 * The full number is passed to `onChange` as one string, e.g. "+1 2125550123",
 * so the rest of the form can treat it like a normal text field.
 */
export default function PhoneField({ id, value, onChange, defaultCountry = 'us', placeholder }) {
  const [code, setCode] = useState(defaultCountry);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);
  const numberRef = useRef(null);

  const country = byCode[code];
  const number = value.startsWith(country.dial) ? value.slice(country.dial.length).trim() : value;

  // Search by country name, code or dialling code.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return [...pinned, null, ...countries];
    const starts = (c) => c.name.toLowerCase().startsWith(q);
    return countries
      .filter((c) => c.name.toLowerCase().includes(q) || c.code === q || c.dial.slice(1).startsWith(q))
      .sort((a, b) => Number(starts(b)) - Number(starts(a)));
  }, [query]);
  const options = results.filter(Boolean);
  // Each country row with its position among the selectable options.
  const rows = useMemo(() => {
    const out = [];
    let next = 0;
    for (const c of results) {
      if (c) {
        out.push({ country: c, index: next });
        next += 1;
      } else {
        out.push(null);
      }
    }
    return out;
  }, [results]);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  // Keep the highlighted country in view while using the arrow keys.
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  const openList = () => {
    setQuery('');
    setHighlight(0);
    setOpen(true);
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  const choose = (next) => {
    setCode(next.code);
    setOpen(false);
    onChange(number ? `${next.dial} ${number}` : '');
    requestAnimationFrame(() => numberRef.current?.focus());
  };

  const onSearchKey = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (options[highlight]) choose(options[highlight]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`phone-field${open ? ' is-open' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="phone-country"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country code: ${country.name} ${country.dial}. Change country`}
        onClick={() => (open ? setOpen(false) : openList())}
      >
        <img src={flagUrl(country.code)} alt="" width="24" height="16" />
        <span className="phone-dial">{country.dial}</span>
        <Icon name="chevron-down" size={16} />
      </button>

      <input
        ref={numberRef}
        id={id}
        name="phone"
        type="tel"
        autoComplete="tel-national"
        inputMode="tel"
        placeholder={placeholder ?? (code === 'us' || code === 'ca' ? '(555) 000-0000' : 'Phone number')}
        value={number}
        maxLength={30}
        onChange={(event) => {
          const digits = event.target.value.replace(/[^\d\s()-]/g, '');
          onChange(digits.trim() ? `${country.dial} ${digits}` : '');
        }}
      />

      {open && (
        <div className="phone-menu">
          <div className="phone-search">
            <Icon name="search" size={16} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search country or code"
              aria-label="Search country or code"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setHighlight(0);
              }}
              onKeyDown={onSearchKey}
            />
          </div>

          <ul className="phone-list" data-lenis-prevent role="listbox" aria-label="Countries" ref={listRef}>
            {results.length === 0 && <li className="phone-empty">No matching country</li>}
            {rows.map((row, i) => {
              if (!row) return <li key="divider" className="phone-divider" role="separator" />;
              const { country: c, index } = row;
              return (
                <li
                  key={`${c.code}-${i}`}
                  role="option"
                  aria-selected={c.code === code}
                  data-active={index === highlight}
                  className={`${c.code === code ? 'is-selected' : ''}${index === highlight ? ' is-active' : ''}`}
                  onPointerEnter={() => setHighlight(index)}
                  onClick={() => choose(c)}
                >
                  <img src={flagUrl(c.code)} alt="" width="24" height="16" loading="lazy" />
                  <span className="phone-name">{c.name}</span>
                  <span className="phone-code">{c.dial}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
