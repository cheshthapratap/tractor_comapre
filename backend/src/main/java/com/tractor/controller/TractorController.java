package com.tractor.controller;

import com.tractor.model.Tractor;
import com.tractor.service.TractorService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tractors")
@CrossOrigin
public class TractorController {
    private final TractorService service;
    public TractorController(TractorService service) { this.service = service; }

    // GET /api/tractors?q=john&company=Mahindra&minHp=40&maxHp=60&cylinders=3&drive=4WD&maxPrice=10
    @GetMapping
    public List<Tractor> list(@RequestParam(required = false) String q,
                              @RequestParam(required = false) String company,
                              @RequestParam(required = false) Integer minHp,
                              @RequestParam(required = false) Integer maxHp,
                              @RequestParam(required = false) Integer cylinders,
                              @RequestParam(required = false) String drive,
                              @RequestParam(required = false) Double maxPrice) {
        return service.search(q, company, minHp, maxHp, cylinders, drive, maxPrice);
    }

    // GET /api/tractors/compare?ids=1,2,3   (declared before /{id})
    @GetMapping("/compare")
    public List<Tractor> compare(@RequestParam List<Long> ids) { return service.compare(ids); }

    @GetMapping("/{id}")
    public Tractor one(@PathVariable Long id) { return service.get(id); }
}
