export interface Material {
    id: string;
    name: string;
    unit: string;
    pricePerUnit: number;
}

export interface CostComponent {
    name: string;
    cost: number;
}

export interface HPPResult {
    materialCost: number;
    serviceCost: number;
    overheadCost: number;
    totalHPP: number;
    marketplaceFee: number;
    recommendedPrice: number;
    profit: number;
}
