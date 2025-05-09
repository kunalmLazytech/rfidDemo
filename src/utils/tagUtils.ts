// @utils/calculateTagQuantities.ts
import COLORS from '@assets/Components/Colors';

export interface Tag {
  epc: string;
  tags?: Tag[];
  qtyUsable?: number;
  qtyRepairable?: number;
  qtyDamaged?: number;
  qtyCorroded?: number;
  qtyExpired?: number;
  qtyMissing?: number;
  qtyObsolete?: number;
}

export interface Product {
  skuName: string;
  sku: string;
  tags: Tag[];
}

interface ScannedData {
  raw: string;
  epc: string;
  scannedAt: number;
  updates: Update[];
}

interface Update {
  status: string;
  quantity: number;
}

export interface TagDisplayResult {
  epc: string;
  iconName: string;
  color: string;
  groupColor: string;
  displayTotal: number;
  displayScanned: number;
  tagMatched: boolean;
  icon: string;
}

export interface ScanResult {
  skuName: string;
  expectedQty: number;
  scannedQty: number;
  isGroupTag: boolean;
  icon: string;
  color: string;
}

export interface ScannedEntry {
  epc: string;
  qtyUsable?: number;
  qtyRepairable?: number;
  qtyDamaged?: number;
  qtyCorroded?: number;
  qtyExpired?: number;
  qtyMissing?: number;
  qtyObsolete?: number;
  updatedAt?: Date;
}

export function normalizeEPC(epc: string): string {
  return epc.replace(/^0+/, '');
}
export function getTagTotalQuantity(tag: Tag): number {
  let total = 0;
  function recurse(t: Tag) {
    const fields = [
      t.qtyUsable,
      t.qtyRepairable,
      t.qtyDamaged,
      t.qtyCorroded,
      t.qtyExpired,
      t.qtyMissing,
      t.qtyObsolete,
    ];
    total += fields.reduce((sum, val) => sum + (val || 0), 0);
    if (t.tags) t.tags.forEach(recurse);
  }
  recurse(tag);
  return total;
}

export function compareWithProduct(
  products: Product[],
  scannedEPCs: string[],
): ScanResult[] {
  const normalizedScans = scannedEPCs.map(e => e.replace(/^0+/, ''));
  return products.map(product => {
    let expectedQty = 0;
    let scannedQty = 0;
    product.tags.forEach(tag => {
      const tagQty = getTagTotalQuantity(tag);
      expectedQty += tagQty;

      const normalizedTagEPC = tag.epc.replace(/^0+/, '');
      if (normalizedScans.includes(normalizedTagEPC)) {
        scannedQty += tagQty;
      }
    });
    const isGroupTag = product.tags.length > 1;
    const icon = isGroupTag ? 'cubes' : 'cube';
    let color = COLORS.dark;
    if (scannedQty === expectedQty) {
      color = COLORS.success;
    } else if (scannedQty > 0) {
      color = COLORS.warning;
    }
    return {
      sku: product.sku,
      skuName: product.skuName,
      expectedQty,
      scannedQty,
      isGroupTag,
      icon,
      color,
    };
  });
}
export function compareWithTags(
  tag: Tag,
  scannedEPCs: ScannedData[],
  selectedData?: Product,
): TagDisplayResult {
  const qtyCount = getTagTotalQuantity(tag);
  const isGrouped = qtyCount > 1;
  const scannedItem = scannedEPCs.map(item => normalizeEPC(item.epc));
  const isScanned = scannedItem.includes(normalizeEPC(tag.epc));
  const displayTotal = qtyCount || 1;

  let tagMatched =
    scannedItem.includes(normalizeEPC(tag.epc)) &&
    (selectedData?.tags || []).some(
      t => normalizeEPC(t.epc) === normalizeEPC(tag.epc),
    );

  const matchingScan = scannedEPCs.find(
    s => normalizeEPC(s.epc) === normalizeEPC(tag.epc),
  );

  let qtycounting = 0;
  let displayScanned = 0;
  if (matchingScan) {
    qtycounting = getTagTotalQuantity(matchingScan);
    tagMatched = true;
  }
  displayScanned = isGrouped ? qtycounting : isScanned ? 1 : 0;

  let iconName =
    displayScanned === displayTotal ? 'check-circle' : 'exclamation-circle';
  let color =
    displayScanned === displayTotal
      ? COLORS.success
      : displayScanned > 0
      ? COLORS.warning
      : COLORS.danger;

  let groupColor =
    displayScanned === displayTotal || qtycounting > 0
      ? COLORS.success
      : COLORS.warning;

  if (tagMatched) {
    iconName = 'check-circle';
    color = COLORS.success;
  }

  const icon = isGrouped ? 'cubes' : 'cube';

  return {
    epc: tag.epc,
    iconName,
    color,
    groupColor,
    displayTotal,
    displayScanned,
    tagMatched,
    icon,
  };
}

export function computeScannedThisTag(
  scanEntry: ScannedEntry | undefined,
  tagTotalQty: number,
): number {
  if (!scanEntry) {
    return 0;
  }
  const {
    qtyUsable = 0,
    qtyRepairable = 0,
    qtyDamaged = 0,
    qtyCorroded = 0,
    qtyExpired = 0,
    qtyMissing = 0,
    qtyObsolete = 0,
  } = scanEntry;
  const sumUpdates =
    qtyUsable +
    qtyRepairable +
    qtyDamaged +
    qtyCorroded +
    qtyExpired +
    qtyMissing +
    qtyObsolete;

  if (sumUpdates > 0) {
    return sumUpdates;
  }
  if (tagTotalQty === 1) {
    return 1;
  }
  return 0;
}
