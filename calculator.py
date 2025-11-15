"""
Quotation Calculation Engine
Motor de cálculo de cotizaciones con reglas de negocio para todas las verticales
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


# ============================================================================
# CONFIGURATION & CONSTANTS
# ============================================================================

# Porcentajes de desperdicio por tipo de abertura y film
WASTE_MATRIX = {
    # Ventanas
    "window": {
        "laminate_security": Decimal("0.15"),      # 15%
        "solar_control": Decimal("0.15"),
        "vinyl_decorative": Decimal("0.12"),
        "privacy": Decimal("0.12"),
    },
    # Puertas
    "door": {
        "laminate_security": Decimal("0.18"),
        "solar_control": Decimal("0.18"),
        "vinyl_decorative": Decimal("0.15"),
        "privacy": Decimal("0.15"),
    },
    # Puertas corredizas (mayor complejidad)
    "sliding_door": {
        "laminate_security": Decimal("0.20"),
        "solar_control": Decimal("0.20"),
        "vinyl_decorative": Decimal("0.18"),
        "privacy": Decimal("0.18"),
    },
    # Mamparas de baño
    "shower_enclosure": {
        "laminate_security": Decimal("0.22"),
        "solar_control": Decimal("0.22"),
        "vinyl_decorative": Decimal("0.20"),
        "privacy": Decimal("0.18"),
    },
    # Divisiones y particiones
    "partition": {
        "laminate_security": Decimal("0.20"),
        "solar_control": Decimal("0.20"),
        "vinyl_decorative": Decimal("0.15"),
        "privacy": Decimal("0.15"),
    },
    # Tragaluces (alta complejidad)
    "skylight": {
        "laminate_security": Decimal("0.25"),
        "solar_control": Decimal("0.25"),
        "vinyl_decorative": Decimal("0.22"),
        "privacy": Decimal("0.22"),
    },
    # Fachadas de vidrio (curtain walls)
    "curtain_wall": {
        "laminate_security": Decimal("0.20"),
        "solar_control": Decimal("0.20"),
        "vinyl_decorative": Decimal("0.18"),
        "privacy": Decimal("0.18"),
    },
    # Franjas (bajo desperdicio)
    "strip_horizontal": {
        "vinyl_decorative": Decimal("0.08"),
        "privacy": Decimal("0.08"),
    },
    "strip_vertical": {
        "vinyl_decorative": Decimal("0.08"),
        "privacy": Decimal("0.08"),
    },
    # Automotriz - Vidrios curvos (máximo desperdicio)
    "automotive_curved": {
        "laminate_security": Decimal("0.30"),
        "solar_control": Decimal("0.30"),
        "vinyl_decorative": Decimal("0.28"),
    },
    # Automotriz - Vidrios planos
    "automotive_flat": {
        "laminate_security": Decimal("0.20"),
        "solar_control": Decimal("0.20"),
        "vinyl_decorative": Decimal("0.18"),
    },
}

# Tasa de impuesto por defecto
DEFAULT_TAX_RATE = Decimal("0.21")  # 21% IVA

# Descuentos por volumen (m² totales)
VOLUME_DISCOUNTS = [
    (Decimal("500"), Decimal("0.20")),  # 500+ m² = 20% descuento
    (Decimal("200"), Decimal("0.15")),  # 200+ m² = 15% descuento
    (Decimal("100"), Decimal("0.10")),  # 100+ m² = 10% descuento
    (Decimal("50"), Decimal("0.05")),   # 50+ m² = 5% descuento
]


# ============================================================================
# DATA STRUCTURES
# ============================================================================

@dataclass
class OpeningData:
    """Datos de una abertura para calcular"""
    opening_id: str
    opening_type: str  # window, door, etc.
    width: Decimal  # metros
    height: Decimal  # metros
    quantity: int
    specifications: Dict  # glass_type, curved, etc.
    room_name: str
    floor: int


@dataclass
class ProductData:
    """Datos de un producto/film"""
    product_id: str
    product_type: str  # laminate_security, solar_control, etc.
    sku: str
    name: str
    price_per_sqm: Decimal
    installation_per_sqm: Decimal
    specifications: Dict


@dataclass
class CalculationItem:
    """Item calculado de cotización"""
    opening_id: str
    product_id: str
    opening_name: str
    product_name: str
    
    # Dimensiones y cantidades
    base_width: Decimal
    base_height: Decimal
    base_area: Decimal  # área sin desperdicio
    waste_percentage: Decimal
    waste_area: Decimal
    final_area: Decimal  # área con desperdicio
    quantity: int  # número de aberturas iguales
    
    # Costos
    material_cost_per_sqm: Decimal
    installation_cost_per_sqm: Decimal
    complexity_factor: Decimal
    
    material_subtotal: Decimal
    installation_subtotal: Decimal
    item_subtotal: Decimal
    
    # Metadata
    unit: str  # "m²" o "m"
    specifications: Dict


@dataclass
class QuotationCalculationResult:
    """Resultado completo del cálculo de cotización"""
    items: List[CalculationItem]
    
    # Totales
    total_base_area: Decimal
    total_waste_area: Decimal
    total_final_area: Decimal
    
    # Montos
    material_subtotal: Decimal
    installation_subtotal: Decimal
    subtotal_before_discount: Decimal
    
    volume_discount_percentage: Decimal
    volume_discount_amount: Decimal
    
    subtotal_after_discount: Decimal
    
    tax_rate: Decimal
    tax_amount: Decimal
    
    total: Decimal
    
    # Detalles de cálculo
    calculation_details: Dict


# ============================================================================
# CALCULATION ENGINE
# ============================================================================

class QuotationCalculator:
    """Motor de cálculo de cotizaciones"""
    
    def __init__(self, tax_rate: Optional[Decimal] = None):
        """
        Inicializar calculadora
        
        Args:
            tax_rate: Tasa de impuesto (None para usar default)
        """
        self.tax_rate = tax_rate or DEFAULT_TAX_RATE
    
    def calculate_waste_percentage(
        self,
        opening_type: str,
        product_type: str,
        specifications: Optional[Dict] = None
    ) -> Decimal:
        """
        Calcular porcentaje de desperdicio según tipo de abertura y film
        
        Args:
            opening_type: Tipo de abertura (window, door, etc.)
            product_type: Tipo de film (laminate_security, etc.)
            specifications: Especificaciones adicionales (curved, etc.)
        
        Returns:
            Porcentaje de desperdicio como Decimal (ej: 0.15 = 15%)
        """
        specifications = specifications or {}
        
        # Ajustar tipo si es automotriz y curvo
        if specifications.get("curved", False):
            opening_type = "automotive_curved"
        elif specifications.get("automotive", False):
            opening_type = "automotive_flat"
        
        # Obtener porcentaje de la matriz
        waste_pct = WASTE_MATRIX.get(opening_type, {}).get(
            product_type,
            Decimal("0.15")  # Default 15%
        )
        
        # Ajustes adicionales por complejidad
        if specifications.get("difficult_access", False):
            waste_pct += Decimal("0.05")  # +5% por acceso difícil
        
        if specifications.get("irregular_shape", False):
            waste_pct += Decimal("0.08")  # +8% por forma irregular
        
        # Tope máximo de 35%
        return min(waste_pct, Decimal("0.35"))
    
    def calculate_complexity_factor(
        self,
        specifications: Dict
    ) -> Decimal:
        """
        Calcular factor de complejidad de instalación
        Este factor multiplica el costo de instalación
        
        Args:
            specifications: Especificaciones de la instalación
        
        Returns:
            Factor multiplicador (1.0 = normal, >1.0 = más complejo)
        """
        factor = Decimal("1.0")
        
        # Altura de instalación (por piso)
        floor = specifications.get("floor", 1)
        if floor > 3:
            factor *= Decimal("1.2")  # +20% por altura
        elif floor > 6:
            factor *= Decimal("1.4")  # +40% por mucha altura
        
        # Acceso difícil
        if specifications.get("difficult_access", False):
            factor *= Decimal("1.3")  # +30%
        
        # Vidrio curvo
        if specifications.get("curved", False):
            factor *= Decimal("1.5")  # +50%
        
        # Condiciones extremas
        if specifications.get("extreme_weather", False):
            factor *= Decimal("1.15")  # +15%
        
        # Instalación en horario nocturno
        if specifications.get("night_install", False):
            factor *= Decimal("1.25")  # +25%
        
        # Requiere andamios o equipos especiales
        if specifications.get("requires_scaffolding", False):
            factor *= Decimal("1.4")  # +40%
        
        return factor
    
    def calculate_volume_discount(
        self,
        total_area: Decimal
    ) -> Tuple[Decimal, Decimal]:
        """
        Calcular descuento por volumen
        
        Args:
            total_area: Área total en m²
        
        Returns:
            Tuple (porcentaje_descuento, monto_descuento)
        """
        for threshold, discount_pct in VOLUME_DISCOUNTS:
            if total_area >= threshold:
                return discount_pct, discount_pct
        
        return Decimal("0.0"), Decimal("0.0")
    
    def calculate_opening_area(
        self,
        opening: OpeningData
    ) -> Tuple[Decimal, Decimal, Decimal]:
        """
        Calcular área de una abertura
        
        Args:
            opening: Datos de la abertura
        
        Returns:
            Tuple (area_base, area_desperdicio, area_final)
        """
        # Área base
        base_area = opening.width * opening.height * Decimal(str(opening.quantity))
        base_area = base_area.quantize(Decimal("0.01"), ROUND_HALF_UP)
        
        # Cálculo específico para franjas
        if "strip" in opening.opening_type:
            # Para franjas, el cálculo es por metro lineal
            # Convertir a área basado en ancho estándar de film (típicamente 1.52m)
            film_width = Decimal("1.52")
            # Si es franja horizontal, usar el ancho de la ventana
            # Si es vertical, usar la altura
            if opening.opening_type == "strip_horizontal":
                linear_meters = opening.width * Decimal(str(opening.quantity))
            else:  # strip_vertical
                linear_meters = opening.height * Decimal(str(opening.quantity))
            
            # Área = metros lineales * ancho del film
            base_area = linear_meters * film_width
            base_area = base_area.quantize(Decimal("0.01"), ROUND_HALF_UP)
        
        return base_area, Decimal("0"), base_area
    
    def calculate_item(
        self,
        opening: OpeningData,
        product: ProductData
    ) -> CalculationItem:
        """
        Calcular un item de cotización
        
        Args:
            opening: Datos de la abertura
            product: Datos del producto/film
        
        Returns:
            Item calculado
        """
        # Calcular áreas
        base_area, _, _ = self.calculate_opening_area(opening)
        
        # Calcular desperdicio
        waste_pct = self.calculate_waste_percentage(
            opening.opening_type,
            product.product_type,
            opening.specifications
        )
        waste_area = base_area * waste_pct
        final_area = base_area + waste_area
        
        # Redondear áreas
        base_area = base_area.quantize(Decimal("0.01"), ROUND_HALF_UP)
        waste_area = waste_area.quantize(Decimal("0.01"), ROUND_HALF_UP)
        final_area = final_area.quantize(Decimal("0.01"), ROUND_HALF_UP)
        
        # Calcular complejidad
        complexity_factor = self.calculate_complexity_factor(opening.specifications)
        
        # Costos de material
        material_cost_per_sqm = product.price_per_sqm
        material_subtotal = final_area * material_cost_per_sqm
        
        # Costos de instalación (con factor de complejidad)
        installation_cost_per_sqm = product.installation_per_sqm * complexity_factor
        installation_subtotal = final_area * installation_cost_per_sqm
        
        # Subtotal del item
        item_subtotal = material_subtotal + installation_subtotal
        
        # Redondear montos
        material_subtotal = material_subtotal.quantize(Decimal("0.01"), ROUND_HALF_UP)
        installation_subtotal = installation_subtotal.quantize(Decimal("0.01"), ROUND_HALF_UP)
        item_subtotal = item_subtotal.quantize(Decimal("0.01"), ROUND_HALF_UP)
        
        return CalculationItem(
            opening_id=opening.opening_id,
            product_id=product.product_id,
            opening_name=f"{opening.room_name} - {opening.opening_type}",
            product_name=product.name,
            
            base_width=opening.width,
            base_height=opening.height,
            base_area=base_area,
            waste_percentage=waste_pct,
            waste_area=waste_area,
            final_area=final_area,
            quantity=opening.quantity,
            
            material_cost_per_sqm=material_cost_per_sqm,
            installation_cost_per_sqm=installation_cost_per_sqm,
            complexity_factor=complexity_factor,
            
            material_subtotal=material_subtotal,
            installation_subtotal=installation_subtotal,
            item_subtotal=item_subtotal,
            
            unit="m²",
            specifications=opening.specifications
        )
    
    def calculate_quotation(
        self,
        openings: List[OpeningData],
        products: List[ProductData],
        custom_tax_rate: Optional[Decimal] = None
    ) -> QuotationCalculationResult:
        """
        Calcular cotización completa
        
        Args:
            openings: Lista de aberturas
            products: Lista de productos (debe coincidir con openings)
            custom_tax_rate: Tasa de impuesto personalizada (None para usar default)
        
        Returns:
            Resultado completo del cálculo
        """
        if len(openings) != len(products):
            raise ValueError("Debe haber un producto por cada abertura")
        
        # Usar tasa de impuesto personalizada si se proporciona
        tax_rate = custom_tax_rate or self.tax_rate
        
        # Calcular items
        items: List[CalculationItem] = []
        for opening, product in zip(openings, products):
            item = self.calculate_item(opening, product)
            items.append(item)
        
        # Totales de áreas
        total_base_area = sum(item.base_area for item in items)
        total_waste_area = sum(item.waste_area for item in items)
        total_final_area = sum(item.final_area for item in items)
        
        # Totales de montos
        material_subtotal = sum(item.material_subtotal for item in items)
        installation_subtotal = sum(item.installation_subtotal for item in items)
        subtotal_before_discount = material_subtotal + installation_subtotal
        
        # Descuento por volumen
        volume_discount_pct, _ = self.calculate_volume_discount(total_final_area)
        volume_discount_amount = subtotal_before_discount * volume_discount_pct
        
        # Subtotal después de descuento
        subtotal_after_discount = subtotal_before_discount - volume_discount_amount
        
        # Impuestos
        tax_amount = subtotal_after_discount * tax_rate
        
        # Total final
        total = subtotal_after_discount + tax_amount
        
        # Redondear todos los montos
        total_base_area = total_base_area.quantize(Decimal("0.01"), ROUND_HALF_UP)
        total_waste_area = total_waste_area.quantize(Decimal("0.01"), ROUND_HALF_UP)
        total_final_area = total_final_area.quantize(Decimal("0.01"), ROUND_HALF_UP)
        material_subtotal = material_subtotal.quantize(Decimal("0.01"), ROUND_HALF_UP)
        installation_subtotal = installation_subtotal.quantize(Decimal("0.01"), ROUND_HALF_UP)
        subtotal_before_discount = subtotal_before_discount.quantize(Decimal("0.01"), ROUND_HALF_UP)
        volume_discount_amount = volume_discount_amount.quantize(Decimal("0.01"), ROUND_HALF_UP)
        subtotal_after_discount = subtotal_after_discount.quantize(Decimal("0.01"), ROUND_HALF_UP)
        tax_amount = tax_amount.quantize(Decimal("0.01"), ROUND_HALF_UP)
        total = total.quantize(Decimal("0.01"), ROUND_HALF_UP)
        
        # Detalles adicionales
        calculation_details = {
            "items_count": len(items),
            "average_waste_percentage": float(total_waste_area / total_base_area) if total_base_area > 0 else 0.0,
            "volume_discount_threshold_reached": total_final_area >= Decimal("50"),
            "tax_rate": float(tax_rate),
            "has_complex_installation": any(
                item.complexity_factor > Decimal("1.0") for item in items
            ),
            "total_rooms": len(set(item.opening_name.split(" - ")[0] for item in items)),
        }
        
        return QuotationCalculationResult(
            items=items,
            
            total_base_area=total_base_area,
            total_waste_area=total_waste_area,
            total_final_area=total_final_area,
            
            material_subtotal=material_subtotal,
            installation_subtotal=installation_subtotal,
            subtotal_before_discount=subtotal_before_discount,
            
            volume_discount_percentage=volume_discount_pct,
            volume_discount_amount=volume_discount_amount,
            
            subtotal_after_discount=subtotal_after_discount,
            
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            
            total=total,
            
            calculation_details=calculation_details
        )


# ============================================================================
# PRICING STRATEGIES
# ============================================================================

class PricingStrategy:
    """Estrategias de pricing avanzadas"""
    
    @staticmethod
    def apply_seasonal_discount(
        subtotal: Decimal,
        month: int
    ) -> Tuple[Decimal, str]:
        """
        Aplicar descuento estacional
        
        Args:
            subtotal: Subtotal de la cotización
            month: Mes del año (1-12)
        
        Returns:
            Tuple (descuento_amount, razón)
        """
        # Temporada baja (descuentos mayores)
        if month in [3, 4, 11]:  # Marzo, Abril, Noviembre
            return subtotal * Decimal("0.10"), "Descuento temporada baja (10%)"
        
        # Verano (leve descuento)
        if month in [12, 1, 2]:  # Diciembre, Enero, Febrero
            return subtotal * Decimal("0.05"), "Descuento verano (5%)"
        
        return Decimal("0.00"), ""
    
    @staticmethod
    def apply_loyalty_discount(
        subtotal: Decimal,
        customer_total_purchases: Decimal
    ) -> Tuple[Decimal, str]:
        """
        Aplicar descuento por lealtad del cliente
        
        Args:
            subtotal: Subtotal de la cotización
            customer_total_purchases: Total histórico de compras del cliente
        
        Returns:
            Tuple (descuento_amount, razón)
        """
        if customer_total_purchases >= Decimal("50000"):
            return subtotal * Decimal("0.15"), "Cliente VIP (15%)"
        elif customer_total_purchases >= Decimal("20000"):
            return subtotal * Decimal("0.10"), "Cliente Premium (10%)"
        elif customer_total_purchases >= Decimal("10000"):
            return subtotal * Decimal("0.05"), "Cliente frecuente (5%)"
        
        return Decimal("0.00"), ""
    
    @staticmethod
    def calculate_rush_surcharge(
        subtotal: Decimal,
        days_until_installation: int
    ) -> Tuple[Decimal, str]:
        """
        Calcular recargo por urgencia
        
        Args:
            subtotal: Subtotal de la cotización
            days_until_installation: Días hasta la instalación
        
        Returns:
            Tuple (recargo_amount, razón)
        """
        if days_until_installation <= 2:
            return subtotal * Decimal("0.25"), "Instalación urgente 48hs (+25%)"
        elif days_until_installation <= 5:
            return subtotal * Decimal("0.15"), "Instalación express 5 días (+15%)"
        elif days_until_installation <= 7:
            return subtotal * Decimal("0.10"), "Instalación prioritaria 1 semana (+10%)"
        
        return Decimal("0.00"), ""


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def format_currency(amount: Decimal, currency: str = "USD") -> str:
    """
    Formatear monto como moneda
    
    Args:
        amount: Monto a formatear
        currency: Código de moneda (USD, ARS, etc.)
    
    Returns:
        String formateado (ej: "$1,234.56")
    """
    symbols = {
        "USD": "$",
        "ARS": "$",
        "EUR": "€",
        "GBP": "£",
    }
    
    symbol = symbols.get(currency, "$")
    formatted = f"{amount:,.2f}"
    return f"{symbol}{formatted}"


def generate_quotation_summary(result: QuotationCalculationResult) -> Dict:
    """
    Generar resumen de cotización para mostrar al cliente
    
    Args:
        result: Resultado del cálculo
    
    Returns:
        Diccionario con resumen formateado
    """
    return {
        "items_count": len(result.items),
        "total_area": {
            "value": float(result.total_final_area),
            "formatted": f"{result.total_final_area:.2f} m²",
        },
        "pricing": {
            "material": {
                "value": float(result.material_subtotal),
                "formatted": format_currency(result.material_subtotal),
            },
            "installation": {
                "value": float(result.installation_subtotal),
                "formatted": format_currency(result.installation_subtotal),
            },
            "subtotal": {
                "value": float(result.subtotal_before_discount),
                "formatted": format_currency(result.subtotal_before_discount),
            },
            "discount": {
                "percentage": float(result.volume_discount_percentage * 100),
                "value": float(result.volume_discount_amount),
                "formatted": format_currency(result.volume_discount_amount),
            },
            "tax": {
                "rate": float(result.tax_rate * 100),
                "value": float(result.tax_amount),
                "formatted": format_currency(result.tax_amount),
            },
            "total": {
                "value": float(result.total),
                "formatted": format_currency(result.total),
            },
        },
        "details": result.calculation_details,
    }
