package com.tractor.model;

import jakarta.persistence.*;

/** Public fields keep the entity short; JSON names match the frontend (colorHex, liftKg ...). */
@Entity
@Table(name = "tractor")
public class Tractor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    public String company;
    public String model;
    public int hp;
    public int cylinders;      // 3, 4 or 6
    public int rpm;            // rated engine rpm
    public String color;
    public String colorHex;    // used by the 3D model
    public int fuelTank;       // litres
    public int liftKg;         // hydraulic lift capacity
    public String drive;       // 2WD / 4WD
    public String gears;
    public double priceLakh;   // approx. ex-showroom, INR lakh
    public String description;
}
