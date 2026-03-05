'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Separator } from '@/components/ui'
import { Button } from '@/components/ui'
import {
  getDesignSystemCss,
  getDesignSystemReact,
  downloadFile,
  buildDesignSystemPdf,
} from '@/lib/design-system-export'
import { FoundationsColors } from './_sections/foundations-colors'
import { FoundationsTypography } from './_sections/foundations-typography'
import { FoundationsSpacingRadius } from './_sections/foundations-spacing-radius'
import { FoundationsMotion } from './_sections/foundations-motion'
import { PatternsLayouts } from './_sections/patterns-layouts'
import { SectionIcone } from './_sections/section-icone'
import { SectionComponenti } from './_sections/section-componenti'
import { SectionModuli } from './_sections/section-moduli'
import { PatternsHeaders } from './_sections/patterns-headers'
import { DesignHomeSection } from './_sections/design-home'
import { PatternsAuthLogin } from './_sections/patterns-auth-login'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Apple,
  ArrowLeft,
  ArrowRight,
  Award,
  Ban,
  BarChart3,
  Bell,
  BookOpen,
  Box,
  Brain,
  Briefcase,
  Bug,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCheck,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Clock,
  Copy,
  CreditCard,
  Download,
  Dumbbell,
  Edit,
  Edit2,
  Euro,
  Eye,
  EyeOff,
  File,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  Goal,
  GraduationCap,
  Grid3x3,
  GripVertical,
  Hand,
  Heart,
  History,
  Home,
  Image,
  ImagePlus,
  Info,
  Keyboard,
  Layout,
  LayoutGrid,
  List,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Minus,
  MoreVertical,
  Palette,
  Paperclip,
  Pencil,
  Phone,
  Play,
  Plus,
  Quote,
  RefreshCw,
  Repeat,
  RotateCcw,
  Ruler,
  Salad,
  Save,
  Scale,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Smartphone,
  Smile,
  Sparkles,
  Square,
  Star,
  TableIcon,
  Tag,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Type,
  Upload,
  User,
  UserCheck,
  UserCircle,
  UserPlus,
  Users,
  Utensils,
  Video,
  Weight,
  WifiOff,
  X,
  XCircle,
  Zap,
  ZoomIn,
  type LucideIcon,
} from 'lucide-react'
import {
  ACCENTI_ATLETA,
  ACCENT_HEX,
  HOME_PAGES_DESIGN,
  PATH_META,
  RADIUS_PX,
  ICON_NAMES,
} from '@/lib/design-system-data'

const ICON_MAP: Record<string, LucideIcon> = {
  Activity, AlertCircle, AlertTriangle, Apple, ArrowLeft, ArrowRight, Award, Ban, BarChart3, Bell, BookOpen, Box, Brain, Briefcase, Bug, Building2, Calendar, Camera, Check, CheckCheck, CheckCircle, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ClipboardList, Clock, Copy, CreditCard, Download, Dumbbell, Edit, Edit2, Euro, Eye, EyeOff, File, FileCheck, FileSpreadsheet, FileText, Filter, Globe, Goal, GraduationCap, Grid3x3, GripVertical, Hand, Heart, History, Home, Image, ImagePlus, Info, Keyboard, Layout, LayoutGrid, List, Loader2, Lock, LogOut, Mail, MapPin, Menu, MessageCircle, MessageSquare, Minus, MoreVertical, Paperclip, Pencil, Phone, Play, Plus, Quote, RefreshCw, Repeat, RotateCcw, Ruler, Salad, Save, Scale, Search, Send, Settings, Share2, Shield, Smartphone, Smile, Sparkles, Square, Star, TableIcon, Tag, Target, Trash2, TrendingDown, TrendingUp, Trophy, Type, Upload, User, UserCheck, UserCircle, UserPlus, Users, Utensils, Video, Weight, WifiOff, X, XCircle, Zap, ZoomIn,
}
const ICON_SAMPLES = ICON_NAMES.map((name) => ({ name, Icon: ICON_MAP[name] })).filter(
  (s): s is { name: string; Icon: LucideIcon } => !!s.Icon,
)
const ICON_BY_NAME = ICON_SAMPLES.reduce(
  (acc, { name, Icon }) => ({ ...acc, [name]: Icon }),
  {} as Record<string, LucideIcon>,
)
ICON_BY_NAME['ImageIcon'] = Image

const NAV = [
  { id: 'colori', label: 'Colori', icon: Palette },
  { id: 'tipografia', label: 'Tipografia', icon: Type },
  { id: 'radius', label: 'Radius & Spacing', icon: Square },
  { id: 'motion', label: 'Motion', icon: Zap },
  { id: 'layouts', label: 'Layouts', icon: Layout },
  { id: 'icone', label: 'Icone', icon: Sparkles },
  { id: 'componenti', label: 'Componenti', icon: Box },
  { id: 'moduli', label: 'Moduli', icon: LayoutGrid },
  { id: 'home', label: 'Design Home', icon: Home },
  { id: 'auth', label: 'Auth (Login)', icon: LogIn },
] as const

export default function DesignSystemPage() {
  const [pdfLoading, setPdfLoading] = useState(false)

  const handleDownloadCss = useCallback(() => {
    const css = getDesignSystemCss()
    downloadFile(css, '22club-design-system.css', 'text/css')
  }, [])

  const handleDownloadReact = useCallback(() => {
    const react = getDesignSystemReact()
    downloadFile(react, '22club-design-system-tokens.ts', 'text/typescript')
  }, [])

  const handleDownloadPdf = useCallback(async () => {
    setPdfLoading(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      buildDesignSystemPdf(doc)
      doc.save('22club-design-system.pdf')
    } catch (e) {
      console.error('Export PDF failed', e)
    } finally {
      setPdfLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold tracking-tight">22Club Design System</h1>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={handleDownloadCss} className="border-border hover:bg-background-tertiary/50 text-text-secondary">
              <FileText className="mr-1.5 h-4 w-4" />
              Scarica CSS
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadReact} className="border-border hover:bg-background-tertiary/50 text-text-secondary">
              <Copy className="mr-1.5 h-4 w-4" />
              Scarica React
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={pdfLoading} className="border-border hover:bg-background-tertiary/50 text-text-secondary">
              {pdfLoading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
              {pdfLoading ? 'Generazione...' : 'Scarica PDF'}
            </Button>
            <Link href="/" className="text-sm text-text-secondary hover:text-primary transition-colors whitespace-nowrap ml-1">
              ← Torna all&apos;app
            </Link>
          </div>
        </div>

        <nav className="mx-auto max-w-5xl overflow-x-auto px-4 pb-3">
          <ul className="flex gap-2">
            {NAV.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-surface-200 px-3 py-2 text-sm text-text-secondary hover:bg-surface-300 hover:text-text-primary transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-4 py-10">
        <FoundationsColors />
        <Separator className="bg-border" />
        <FoundationsTypography />
        <Separator className="bg-border" />
        <FoundationsSpacingRadius />
        <Separator className="bg-border" />
        <FoundationsMotion />
        <Separator className="bg-border" />
        <PatternsLayouts />
        <Separator className="bg-border" />
        <SectionIcone iconSamples={ICON_SAMPLES} />
        <Separator className="bg-border" />
        <SectionComponenti />
        <Separator className="bg-border" />
        <SectionModuli />
        <Separator className="bg-border" />
        <PatternsHeaders />
        <Separator className="bg-border" />
        <DesignHomeSection
          homePagesDesign={HOME_PAGES_DESIGN}
          pathMeta={PATH_META}
          accentiAtleta={ACCENTI_ATLETA}
          accentHex={ACCENT_HEX}
          radiusPx={RADIUS_PX}
          iconByName={ICON_BY_NAME}
        />
        <Separator className="bg-border" />
        <PatternsAuthLogin />
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-text-muted">
        22Club Design System — Solo riferimento interno. URL: /design-system
      </footer>
    </div>
  )
}
