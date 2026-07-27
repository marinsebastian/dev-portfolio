'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { LayerCode, ScopeType } from '@/data/mauForondaCensusData';

/** Census indicators for the block the user last clicked, in real units. */
export interface SelectedBlock {
  lngLat: string;
  lat: number;
  lng: number;
  /** Inhabitants per hectare, straight from the archive. */
  densityPerHa: number | null;
  /** Inhabitants in this block. */
  population: number | null;
  internetPct: number | null;
  waterPct: number | null;
  educationPct: number | null;
}

export interface UserLocation {
  lat: number;
  lng: number;
  /** Best-effort department name, e.g. "Cochabamba". */
  department: string | null;
  city: string | null;
  /** How the position was obtained — shown to the user, never guessed at. */
  source: 'gps' | 'ip';
  accuracyM: number | null;
}

/** Dims blocks outside the range on the active layer instead of hiding them. */
export interface MetricThreshold {
  min: number;
  max: number | null;
}

export interface VisibleStats {
  count: number;
  median: number;
  p90: number;
  max: number;
  /** The archive field the statistics were computed over. */
  field: string;
}

/**
 * Imperative surface the map widget publishes so the AI copilot and the
 * geolocation flow can drive the camera without either of them holding a
 * MapLibre instance.
 */
export interface MapController {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  getCenter: () => { lat: number; lng: number };
  getZoom: () => number;
  getRenderedBlockCount: () => number;
  getVisibleStats: () => VisibleStats | null;
}

interface GeoConsoleValue {
  activeScope: ScopeType;
  setActiveScope: (scope: ScopeType) => void;
  activeLayer: LayerCode;
  setActiveLayer: (layer: LayerCode) => void;

  threshold: MetricThreshold | null;
  setThreshold: (threshold: MetricThreshold | null) => void;

  selectedBlock: SelectedBlock | null;
  setSelectedBlock: (block: SelectedBlock | null) => void;

  userLocation: UserLocation | null;
  setUserLocation: (location: UserLocation | null) => void;

  focusedMode: boolean;
  setFocusedMode: (focused: boolean) => void;

  visibleStats: VisibleStats | null;
  setVisibleStats: (stats: VisibleStats | null) => void;

  /** Called by the map widget on mount; returns a cleanup that unregisters. */
  registerMapController: (controller: MapController) => () => void;
  /** Null until the map has mounted. */
  getMapController: () => MapController | null;
}

const GeoConsoleContext = createContext<GeoConsoleValue | undefined>(undefined);

export function GeoConsoleProvider({ children }: { children: React.ReactNode }) {
  const [activeScope, setActiveScope] = useState<ScopeType>('Santa Cruz');
  const [activeLayer, setActiveLayer] = useState<LayerCode>('DENSITY');
  const [threshold, setThreshold] = useState<MetricThreshold | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [focusedMode, setFocusedMode] = useState(false);
  const [visibleStats, setVisibleStats] = useState<VisibleStats | null>(null);

  // A ref, not state: the controller identity changing must not re-render the
  // whole console, and consumers only ever read it inside event handlers.
  const controllerRef = useRef<MapController | null>(null);

  const registerMapController = useCallback((controller: MapController) => {
    controllerRef.current = controller;
    return () => {
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, []);

  const getMapController = useCallback(() => controllerRef.current, []);

  const value = useMemo(
    () => ({
      activeScope,
      setActiveScope,
      activeLayer,
      setActiveLayer,
      threshold,
      setThreshold,
      selectedBlock,
      setSelectedBlock,
      userLocation,
      setUserLocation,
      focusedMode,
      setFocusedMode,
      visibleStats,
      setVisibleStats,
      registerMapController,
      getMapController,
    }),
    [
      activeScope,
      activeLayer,
      threshold,
      selectedBlock,
      userLocation,
      focusedMode,
      visibleStats,
      registerMapController,
      getMapController,
    ]
  );

  return <GeoConsoleContext.Provider value={value}>{children}</GeoConsoleContext.Provider>;
}

export function useGeoConsole() {
  const context = useContext(GeoConsoleContext);
  if (!context) {
    throw new Error('useGeoConsole must be used within a GeoConsoleProvider');
  }
  return context;
}
