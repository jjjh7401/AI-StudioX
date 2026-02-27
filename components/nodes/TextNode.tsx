
import React, { useState, useRef, useEffect } from 'react';
import { Node, TextNodeData } from '../../types';
import { ChevronDownIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface TextNodeProps {
  node: Node;
  onDataChange: (id: string, data: Partial<TextNodeData>) => void;
  isCollapsed: boolean;
}

// Fashion Photography
const FASHION_ULTRA_REAL_EDITORIAL = `(extreme photorealism, editorial fashion shoot, stills archive), captured on **Phase One IQ4**, **85mm f/1.2**, RAW, **IMG_9854.CR2**, hyper-detailed skin texture, cinematic color science, diffused softbox lighting with gentle rim light, luxury studio setup, shallow depth of field, ultra-clean bokeh, realistic shadows, premium wardrobe styling with natural fabric textures, high-end magazine finish (Vogue Italia, Harper’s Bazaar)`;
const FASHION_CINEMATIC_COMMERCIAL = `(high-end commercial photography, hyper-realistic campaign shot), photographed with **Canon EOS R5**, **50mm f/1.2 L**, RAW, **IMG_2985.HEIC** metadata simulation, beauty dish key light + soft bounce fill, glossy highlights on surfaces, premium product textures, cinematic 16:9 framing, vivid micro-contrast, luxury brand aesthetic, natural imperfections, authentic shadows, editorial-grade color grading (Milan Fashion Week campaign)`;
const FASHION_STUDIO_PORTRAIT = `(professional studio portrait, extreme realism, Hasselblad H6D), **100mm f/2.2**, macro-level skin detail, ultra-soft gradient backdrop, controlled beauty lighting setup (key: beauty dish, fill: white reflector, hair light rim), realistic pores, soft transition shadows, crisp edges, fine fabric definition, elegant pose direction, high fashion styling, glossy premium finish, RAW dynamic range`;
const FASHION_STREET_EDITORIAL = `(street editorial realism, Magnum-style candid composition), shot on **Leica SL2**, **35mm f/1.4**, RAW, contact sheet scan aesthetic, filmic grain micro-texture, natural sunlight with long shadows, reflective surfaces, authentic color shifts, soft atmospheric haze, walking motion blur minimal, subject-centered focus isolation, archive photography look (stills archive, Getty Images watermark subtle simulation)`;
const FASHION_FILM_STILL = `(cinematic film still, extreme photorealism), RED Komodo 6K simulation, **Leica 50mm Summilux-C**, T1.4, precise motion still capture, volumetric light streaks, soft golden hour rim light, moody ambient shadows, high-contrast editorial color palette, premium wardrobe movement, real-world material physics, lens breathing, anamorphic bokeh hints, professional DI color grade (Kodak 2383 print emulation)`;

// Product Photography
const PRODUCT_ULTRA_REAL_STUDIO = `(extreme photorealism, high-end product shoot), premium studio setup with diffused softbox lighting and controlled shadows, glossy reflection floor, hyper-detailed texture mapping, captured on **Phase One IQ4**, **80mm f/2.8 Schneider Lens**, RAW, crisp edges, true-to-life material rendering, micro-contrast enhancement, luxury commercial aesthetic, cinematic color grading (IMG_9854.CR2 metadata), product centered with perfect symmetry, ultra HD 16:9`;
const PRODUCT_LUXURY_MACRO = `(macro product photography, extreme close-up realism), shot on **Canon EOS R5**, **100mm f/2.8L Macro**, RAW micro-detail capture, soft directional rim light highlighting surfaces, ultra-fine fabric / metal / glass texture reveal, natural shadows, studio matte backdrop, cinematic micro-contrast, product label sharpness, shallow depth of field, (IMG_2985.HEIC) metadata simulation for realism boost`;
const PRODUCT_PREMIUM_LIFESTYLE = `(high-end lifestyle product photography, cinematic realism), product placed in natural environment with authentic light, captured on **Leica SL2**, **50mm f/1.4 Summilux**, golden hour soft light, realistic shadows, organic materials (wood, fabric, marble) with true texture, premium interior aesthetic, bokeh-rich depth, airy color palette, stills archive mood, RAW-level clarity, editorial commercial tone (Vogue Living style)`;
const PRODUCT_LUXURY_FLOATING = `(high-end levitation product shot, surreal photorealism), product floating mid-air with dynamic soft shadows on matte surface, captured on **Sony A7R V**, **35mm f/1.8**, RAW depth simulation, clean gradient background, soft volumetric light beams, smooth reflections, sharp edge lighting, ultra-premium digital commercial look, subtle fog for dimensionality, glossy material accuracy, cinematic 4K framing`;
const PRODUCT_SPLASH_MOTION = `(high-speed motion product photography, ultra real), shot on **RED Komodo 6K**, **50mm T1.5**, splash / powder / mist frozen mid-air at high shutter simulation, crisp liquid physics, dynamic backlight rim, reflective highlights, polished surface detail, dramatic contrast, luxury cosmetic & beverage ad style, RAW dynamic range, cinematic 16:9 composition (stills archive, IMG_4857.CR2)`;

const presets: Record<string, string> = {
  'fashion-ultra-real-editorial': FASHION_ULTRA_REAL_EDITORIAL,
  'fashion-cinematic-commercial': FASHION_CINEMATIC_COMMERCIAL,
  'fashion-studio-portrait': FASHION_STUDIO_PORTRAIT,
  'fashion-street-editorial': FASHION_STREET_EDITORIAL,
  'fashion-film-still': FASHION_FILM_STILL,
  
  'product-ultra-real-studio': PRODUCT_ULTRA_REAL_STUDIO,
  'product-luxury-macro': PRODUCT_LUXURY_MACRO,
  'product-premium-lifestyle': PRODUCT_PREMIUM_LIFESTYLE,
  'product-luxury-floating': PRODUCT_LUXURY_FLOATING,
  'product-splash-motion': PRODUCT_SPLASH_MOTION,
};

const presetCategories = {
    "Fashion Photography": {
      'fashion-ultra-real-editorial': "Ultra-Real Editorial",
      'fashion-cinematic-commercial': "Cinematic Commercial",
      'fashion-studio-portrait': "Studio Portrait",
      'fashion-street-editorial': "Street Editorial",
      'fashion-film-still': "Fashion Film Still",
    },
    "Product Photography": {
      'product-ultra-real-studio': "Ultra-Real Studio Master",
      'product-luxury-macro': "Luxury Macro Detail",
      'product-premium-lifestyle': "Premium Lifestyle Scene",
      'product-luxury-floating': "Luxury Floating/Levitation",
      'product-splash-motion': "Splash/Motion Premium",
    }
};

const allPresetNames: Record<string, string> = Object.values(presetCategories).reduce((acc, items) => {
    return { ...acc, ...items };
}, {});


const TextNode: React.FC<TextNodeProps> = ({ node, onDataChange, isCollapsed }) => {
  const data = node.data as TextNodeData;
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as globalThis.Node)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDataChange(node.id, { text: e.target.value, presetKey: null });
  };
  
  const handlePresetSelect = (presetKey: string) => {
    if (presets[presetKey]) {
      onDataChange(node.id, { text: presets[presetKey], presetKey });
    }
    setIsPopoverOpen(false);
  };

  const handleClearPreset = () => {
    onDataChange(node.id, { text: '', presetKey: null });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const buttonClasses = "flex items-center justify-center bg-gray-700 hover:bg-gray-600 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 text-gray-200 text-sm py-1.5 px-3 w-full cursor-pointer transition-colors";

  const presetName = data.presetKey ? allPresetNames[data.presetKey] : null;
  const scale = data.textScale || 1;
  const fontSize = Math.round(16 * scale);

  if (isCollapsed) {
    return (
        <div className="w-full h-full text-gray-300 text-xs font-mono overflow-hidden">
            <p className="whitespace-pre-wrap break-all">{data.text || "No text"}</p>
        </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col space-y-2">
        {presetName && (
            <div className="flex items-center justify-between bg-gray-600 rounded-full px-3 py-1 text-xs text-gray-100 flex-shrink-0">
                <span className="font-semibold truncate" title={presetName}>{presetName}</span>
                <button onClick={handleClearPreset} className="ml-2 text-gray-400 hover:text-white">
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        )}
      <textarea
        value={data.text}
        onChange={handleTextAreaChange}
        className="w-full flex-grow p-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-200 resize-none"
        style={{ fontSize: `${fontSize}px`, lineHeight: '1.5' }}
        placeholder="Enter your text here..."
      />
      <div className="relative">
        <button
          onClick={() => setIsPopoverOpen(prev => !prev)}
          className={buttonClasses}
          aria-haspopup="true"
          aria-expanded={isPopoverOpen}
        >
          Load Preset...
        </button>
        {isPopoverOpen && (
            <div 
                ref={popoverRef}
                className="absolute bottom-full left-0 mb-2 w-full bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-20"
                style={{ maxHeight: '400px', width: '350px' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-3 border-b border-gray-700 flex-shrink-0">
                <h3 className="text-md font-bold text-white">Load a Preset</h3>
                <button onClick={() => setIsPopoverOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                </button>
                </div>
                <div className="p-2 overflow-y-auto" style={{maxHeight: '330px'}}>
                <ul className="space-y-1">
                    {Object.entries(presetCategories).map(([category, items]) => (
                    <li key={category} className="bg-gray-900/50 rounded-lg">
                        <button
                        onClick={() => toggleCategory(category)}
                        className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-700/50 rounded-t-lg flex items-center justify-between transition-colors"
                        >
                        <span>{category}</span>
                        {expandedCategories[category] ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                        </button>
                        {expandedCategories[category] && (
                        <ul className="pl-3 pr-1 py-1">
                            {Object.entries(items).map(([key, name]) => (
                            <li key={key}>
                                <button
                                onClick={() => handlePresetSelect(key)}
                                className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-indigo-600 hover:text-white rounded-md transition-colors"
                                >
                                {name}
                                </button>
                            </li>
                            ))}
                        </ul>
                        )}
                    </li>
                    ))}
                </ul>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TextNode;
