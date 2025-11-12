"""
SQLAlchemy Models for Films Quotation System
Complete database models for all verticals: Automotive, Residential, Commercial
"""
from datetime import datetime
from decimal import Decimal
from enum import Enum as PyEnum
from typing import Optional, List
from uuid import uuid4

from sqlalchemy import (
    Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer,
    JSON, Numeric, String, Text, Index, UniqueConstraint, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship, DeclarativeBase, Mapped, mapped_column
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


# ============================================================================
# ENUMS
# ============================================================================

class CustomerType(str, PyEnum):
    """Tipo de cliente"""
    INDIVIDUAL = "individual"
    BUSINESS = "business"


class VerticalType(str, PyEnum):
    """Vertical de negocio"""
    AUTOMOTIVE = "automotive"
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    ARCHITECTURAL = "architectural"


class QuotationStatus(str, PyEnum):
    """Estado de la cotización"""
    DRAFT = "draft"
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    EXPIRED = "expired"


class ProductType(str, PyEnum):
    """Tipo de producto/film"""
    LAMINATE_SECURITY = "laminate_security"
    SOLAR_CONTROL = "solar_control"
    VINYL_DECORATIVE = "vinyl_decorative"
    PRIVACY = "privacy"
    ANTI_GRAFFITI = "anti_graffiti"
    CUSTOM = "custom"


class PropertyType(str, PyEnum):
    """Tipo de propiedad"""
    HOUSE = "house"
    APARTMENT = "apartment"
    OFFICE = "office"
    BUILDING = "building"
    WAREHOUSE = "warehouse"
    RETAIL = "retail"


class RoomType(str, PyEnum):
    """Tipo de habitación/área"""
    LIVING_ROOM = "living_room"
    BEDROOM = "bedroom"
    KITCHEN = "kitchen"
    BATHROOM = "bathroom"
    OFFICE = "office"
    MEETING_ROOM = "meeting_room"
    LOBBY = "lobby"
    HALLWAY = "hallway"
    BALCONY = "balcony"
    GARAGE = "garage"
    OTHER = "other"


class OpeningType(str, PyEnum):
    """Tipo de abertura"""
    WINDOW = "window"
    DOOR = "door"
    SLIDING_DOOR = "sliding_door"
    FRENCH_DOOR = "french_door"
    SHOWER_ENCLOSURE = "shower_enclosure"
    PARTITION = "partition"
    SKYLIGHT = "skylight"
    CURTAIN_WALL = "curtain_wall"
    STRIP_HORIZONTAL = "strip_horizontal"
    STRIP_VERTICAL = "strip_vertical"


class VehicleType(str, PyEnum):
    """Tipo de vehículo"""
    SEDAN = "sedan"
    SUV = "suv"
    TRUCK = "truck"
    VAN = "van"
    COUPE = "coupe"
    MOTORCYCLE = "motorcycle"


class WhatsAppConversationStatus(str, PyEnum):
    """Estado de conversación WhatsApp"""
    ACTIVE = "active"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class MessageDirection(str, PyEnum):
    """Dirección del mensaje"""
    INBOUND = "inbound"
    OUTBOUND = "outbound"


# ============================================================================
# CUSTOMER & USER MODELS
# ============================================================================

class Customer(Base):
    """Cliente del sistema"""
    __tablename__ = "customers"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    whatsapp: Mapped[Optional[str]] = mapped_column(String(20), index=True)
    customer_type: Mapped[CustomerType] = mapped_column(Enum(CustomerType), nullable=False)
    
    # Información adicional
    company_name: Mapped[Optional[str]] = mapped_column(String(255))
    tax_id: Mapped[Optional[str]] = mapped_column(String(50))
    address: Mapped[Optional[str]] = mapped_column(Text)
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    country: Mapped[Optional[str]] = mapped_column(String(100))
    postal_code: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Metadata flexible
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relationships
    quotations: Mapped[List["Quotation"]] = relationship(back_populates="customer", cascade="all, delete-orphan")
    whatsapp_conversations: Mapped[List["WhatsAppConversation"]] = relationship(back_populates="customer")

    __table_args__ = (
        Index('idx_customers_email', 'email'),
        Index('idx_customers_phone', 'phone'),
        Index('idx_customers_whatsapp', 'whatsapp'),
    )


# ============================================================================
# PRODUCT CATALOG MODELS
# ============================================================================

class ProductCategory(Base):
    """Categoría de productos"""
    __tablename__ = "product_categories"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    vertical: Mapped[VerticalType] = mapped_column(Enum(VerticalType), nullable=False)
    parent_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("product_categories.id"))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    products: Mapped[List["Product"]] = relationship(back_populates="category")
    parent: Mapped[Optional["ProductCategory"]] = relationship(remote_side=[id], back_populates="children")
    children: Mapped[List["ProductCategory"]] = relationship(back_populates="parent")


class Product(Base):
    """Producto/Film"""
    __tablename__ = "products"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    category_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("product_categories.id"), nullable=False)
    sku: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    product_type: Mapped[ProductType] = mapped_column(Enum(ProductType), nullable=False)
    
    # Especificaciones técnicas
    specifications: Mapped[dict] = mapped_column(JSONB, default=dict)
    # {
    #   "material": "polyester",
    #   "color": "charcoal",
    #   "opacity": 95,  # 0-100%
    #   "uv_protection": 99,  # 0-100%
    #   "heat_rejection": 65,  # 0-100%
    #   "visible_light_transmission": 5,  # 0-100%
    #   "thickness_microns": 50,
    #   "warranty_years": 10,
    #   "scratch_resistant": true,
    #   "anti_fade": true
    # }
    
    # Estado y control
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Imágenes
    image_url: Mapped[Optional[str]] = mapped_column(String(500))
    gallery_urls: Mapped[Optional[list]] = mapped_column(JSONB, default=list)
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relationships
    category: Mapped["ProductCategory"] = relationship(back_populates="products")
    prices: Mapped[List["ProductPrice"]] = relationship(back_populates="product", cascade="all, delete-orphan")
    quotation_items: Mapped[List["QuotationItem"]] = relationship(back_populates="product")

    __table_args__ = (
        Index('idx_products_category', 'category_id'),
        Index('idx_products_active', 'active'),
        Index('idx_products_type', 'product_type'),
    )


class ProductPrice(Base):
    """Precios de productos"""
    __tablename__ = "product_prices"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    product_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    
    # Precios según unidad de medida
    price_per_sqm: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))  # Precio por m²
    price_per_linear_meter: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))  # Precio por metro lineal
    installation_per_sqm: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))  # Instalación por m²
    installation_per_linear_meter: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))
    
    # Precios por vertical (pueden variar)
    vertical: Mapped[Optional[VerticalType]] = mapped_column(Enum(VerticalType))
    
    # Moneda y vigencia
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    valid_from: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    valid_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Control
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product: Mapped["Product"] = relationship(back_populates="prices")

    __table_args__ = (
        Index('idx_prices_product_valid', 'product_id', 'valid_from', 'valid_until'),
        Index('idx_prices_active', 'active'),
    )


# ============================================================================
# QUOTATION MODELS
# ============================================================================

class Quotation(Base):
    """Cotización principal"""
    __tablename__ = "quotations"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    quotation_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    customer_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    
    # Tipo de cotización
    vertical: Mapped[VerticalType] = mapped_column(Enum(VerticalType), nullable=False)
    status: Mapped[QuotationStatus] = mapped_column(Enum(QuotationStatus), default=QuotationStatus.DRAFT)
    
    # Montos
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0.00"))
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    
    # Detalles de cálculo
    calculation_details: Mapped[dict] = mapped_column(JSONB, default=dict)
    # {
    #   "total_area_sqm": 150.5,
    #   "waste_percentage": 0.15,
    #   "complexity_factor": 1.2,
    #   "volume_discount_percentage": 0.10,
    #   "tax_rate": 0.21
    # }
    
    # Notas y observaciones
    notes: Mapped[Optional[str]] = mapped_column(Text)
    internal_notes: Mapped[Optional[str]] = mapped_column(Text)
    
    # Vigencia
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
    
    # Relationships
    customer: Mapped["Customer"] = relationship(back_populates="quotations")
    items: Mapped[List["QuotationItem"]] = relationship(back_populates="quotation", cascade="all, delete-orphan")
    property: Mapped[Optional["Property"]] = relationship(back_populates="quotation", uselist=False, cascade="all, delete-orphan")
    vehicle: Mapped[Optional["Vehicle"]] = relationship(back_populates="quotation", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_quotations_customer', 'customer_id'),
        Index('idx_quotations_status', 'status'),
        Index('idx_quotations_vertical', 'vertical'),
        Index('idx_quotations_created', 'created_at'),
    )


class QuotationItem(Base):
    """Items de cotización"""
    __tablename__ = "quotation_items"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    quotation_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quotations.id"), nullable=False)
    product_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    opening_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("openings.id"))
    
    # Cantidades
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)  # "m²", "m", "unit"
    
    # Precios
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    installation_cost: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=Decimal("0.00"))
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    
    # Dimensiones y especificaciones
    dimensions: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    # {
    #   "width": 1.5,
    #   "height": 2.0,
    #   "area": 3.0,
    #   "waste_area": 0.45
    # }
    
    specifications: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    # {
    #   "complexity_factor": 1.2,
    #   "installation_difficulty": "medium",
    #   "access_type": "indoor",
    #   "floor_level": 3
    # }
    
    # Descripción personalizada
    description: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quotation: Mapped["Quotation"] = relationship(back_populates="items")
    product: Mapped["Product"] = relationship(back_populates="quotation_items")
    opening: Mapped[Optional["Opening"]] = relationship(back_populates="quotation_items")

    __table_args__ = (
        Index('idx_items_quotation', 'quotation_id'),
        Index('idx_items_product', 'product_id'),
    )


# ============================================================================
# PROPERTY MODELS (Residential & Commercial)
# ============================================================================

class Property(Base):
    """Propiedad (hogar, edificio, oficina)"""
    __tablename__ = "properties"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    quotation_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quotations.id"), nullable=False)
    
    # Tipo y datos básicos
    property_type: Mapped[PropertyType] = mapped_column(Enum(PropertyType), nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(255))  # Nombre del edificio/proyecto
    
    # Ubicación
    address: Mapped[Optional[str]] = mapped_column(Text)
    city: Mapped[Optional[str]] = mapped_column(String(100))
    state: Mapped[Optional[str]] = mapped_column(String(100))
    postal_code: Mapped[Optional[str]] = mapped_column(String(20))
    location: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)  # {"lat": -34.xxx, "lng": -58.xxx}
    
    # Características
    total_area: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))  # Área total en m²
    floors: Mapped[Optional[int]] = mapped_column(Integer)
    year_built: Mapped[Optional[int]] = mapped_column(Integer)
    
    # Metadata adicional
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    # {
    #   "building_style": "modern",
    #   "glass_type": "tempered",
    #   "has_elevator": true,
    #   "access_notes": "Security checkpoint at entrance"
    # }
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quotation: Mapped["Quotation"] = relationship(back_populates="property")
    rooms: Mapped[List["Room"]] = relationship(back_populates="property", cascade="all, delete-orphan")


class Room(Base):
    """Habitación o área de una propiedad"""
    __tablename__ = "rooms"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    property_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    
    # Identificación
    name: Mapped[str] = mapped_column(String(100), nullable=False)  # "Sala Principal", "Oficina 305"
    room_type: Mapped[RoomType] = mapped_column(Enum(RoomType), nullable=False)
    
    # Características
    area: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2))  # Área en m²
    floor: Mapped[int] = mapped_column(Integer, default=1)
    
    # Metadata
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    # {
    #   "ceiling_height": 2.8,
    #   "has_ac": true,
    #   "sun_exposure": "east",
    #   "privacy_level": "high"
    # }
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    property: Mapped["Property"] = relationship(back_populates="rooms")
    openings: Mapped[List["Opening"]] = relationship(back_populates="room", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_rooms_property', 'property_id'),
    )


class Opening(Base):
    """Abertura (ventana, puerta, mampara, etc.)"""
    __tablename__ = "openings"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=False)
    
    # Tipo de abertura
    opening_type: Mapped[OpeningType] = mapped_column(Enum(OpeningType), nullable=False)
    name: Mapped[Optional[str]] = mapped_column(String(100))  # "Ventana Principal", "Puerta Corrediza"
    
    # Dimensiones
    width: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)  # metros
    height: Mapped[Decimal] = mapped_column(Numeric(8, 2), nullable=False)  # metros
    area: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)  # m² calculado
    quantity: Mapped[int] = mapped_column(Integer, default=1)  # Para múltiples aberturas idénticas
    
    # Especificaciones técnicas
    specifications: Mapped[dict] = mapped_column(JSONB, default=dict)
    # {
    #   "glass_type": "tempered",
    #   "thickness_mm": 6,
    #   "frame_material": "aluminum",
    #   "opening_direction": "sliding",
    #   "has_dividers": false,
    #   "curved": false,
    #   "tinted": false,
    #   "installation_height_m": 1.5,
    #   "difficult_access": false
    # }
    
    # Notas
    notes: Mapped[Optional[str]] = mapped_column(Text)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    room: Mapped["Room"] = relationship(back_populates="openings")
    quotation_items: Mapped[List["QuotationItem"]] = relationship(back_populates="opening")

    __table_args__ = (
        Index('idx_openings_room', 'room_id'),
        CheckConstraint('width > 0', name='check_width_positive'),
        CheckConstraint('height > 0', name='check_height_positive'),
        CheckConstraint('quantity > 0', name='check_quantity_positive'),
    )


# ============================================================================
# VEHICLE MODELS (Automotive)
# ============================================================================

class Vehicle(Base):
    """Vehículo para vertical automotriz"""
    __tablename__ = "vehicles"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    quotation_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quotations.id"), nullable=False)
    
    # Identificación del vehículo
    vin: Mapped[Optional[str]] = mapped_column(String(17), unique=True)
    make: Mapped[str] = mapped_column(String(50), nullable=False)  # Marca
    model: Mapped[str] = mapped_column(String(100), nullable=False)  # Modelo
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    vehicle_type: Mapped[VehicleType] = mapped_column(Enum(VehicleType), nullable=False)
    
    # Color y características
    color: Mapped[Optional[str]] = mapped_column(String(50))
    license_plate: Mapped[Optional[str]] = mapped_column(String(20))
    
    # Especificaciones de vidrios
    glass_specifications: Mapped[dict] = mapped_column(JSONB, default=dict)
    # {
    #   "windshield": {"width": 1.5, "height": 0.8, "curved": true},
    #   "rear": {"width": 1.4, "height": 0.7, "curved": true},
    #   "side_windows": {"front_left": {...}, "front_right": {...}, ...},
    #   "sunroof": {"width": 0.8, "height": 1.2, "type": "panoramic"}
    # }
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    quotation: Mapped["Quotation"] = relationship(back_populates="vehicle")

    __table_args__ = (
        Index('idx_vehicles_vin', 'vin'),
        Index('idx_vehicles_make_model', 'make', 'model', 'year'),
    )


# ============================================================================
# WHATSAPP INTEGRATION MODELS
# ============================================================================

class WhatsAppConversation(Base):
    """Conversación de WhatsApp"""
    __tablename__ = "whatsapp_conversations"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    customer_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("customers.id"))
    
    # Identificación WhatsApp
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    wa_id: Mapped[str] = mapped_column(String(50), nullable=False)  # WhatsApp ID
    
    # Estado de la conversación
    status: Mapped[WhatsAppConversationStatus] = mapped_column(
        Enum(WhatsAppConversationStatus), 
        default=WhatsAppConversationStatus.ACTIVE
    )
    
    # Contexto de la conversación
    context: Mapped[dict] = mapped_column(JSONB, default=dict)
    # {
    #   "current_step": "selecting_vertical",
    #   "vertical": "residential",
    #   "property_data": {...},
    #   "selected_products": [...]
    # }
    
    # Timestamps
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_message_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Relationships
    customer: Mapped[Optional["Customer"]] = relationship(back_populates="whatsapp_conversations")
    messages: Mapped[List["WhatsAppMessage"]] = relationship(back_populates="conversation", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_wa_conv_phone', 'phone_number'),
        Index('idx_wa_conv_customer', 'customer_id'),
        Index('idx_wa_conv_status', 'status'),
    )


class WhatsAppMessage(Base):
    """Mensaje de WhatsApp"""
    __tablename__ = "whatsapp_messages"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    conversation_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("whatsapp_conversations.id"), nullable=False)
    
    # Dirección del mensaje
    direction: Mapped[MessageDirection] = mapped_column(Enum(MessageDirection), nullable=False)
    
    # Contenido
    message_type: Mapped[str] = mapped_column(String(20), default="text")  # text, image, document, etc.
    content: Mapped[Text] = mapped_column(Text, nullable=False)
    
    # WhatsApp metadata
    wa_message_id: Mapped[Optional[str]] = mapped_column(String(100), unique=True)
    metadata: Mapped[Optional[dict]] = mapped_column(JSONB, default=dict)
    
    # Control de estado
    delivered: Mapped[bool] = mapped_column(Boolean, default=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Timestamps
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    read_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    # Relationships
    conversation: Mapped["WhatsAppConversation"] = relationship(back_populates="messages")

    __table_args__ = (
        Index('idx_wa_msg_conversation', 'conversation_id'),
        Index('idx_wa_msg_sent_at', 'sent_at'),
    )


# ============================================================================
# AUDIT & LOGGING
# ============================================================================

class AuditLog(Base):
    """Log de auditoría"""
    __tablename__ = "audit_logs"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Qué se hizo
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # CREATE, UPDATE, DELETE
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # Quotation, Product, etc.
    entity_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    
    # Quién lo hizo
    user_id: Mapped[Optional[UUID]] = mapped_column(UUID(as_uuid=True))
    user_email: Mapped[Optional[str]] = mapped_column(String(255))
    
    # Datos del cambio
    changes: Mapped[dict] = mapped_column(JSONB, default=dict)
    # {"field": {"old": "value1", "new": "value2"}}
    
    # Contexto
    ip_address: Mapped[Optional[str]] = mapped_column(String(45))
    user_agent: Mapped[Optional[str]] = mapped_column(Text)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index('idx_audit_entity', 'entity_type', 'entity_id'),
        Index('idx_audit_user', 'user_id'),
        Index('idx_audit_created', 'created_at'),
    )
