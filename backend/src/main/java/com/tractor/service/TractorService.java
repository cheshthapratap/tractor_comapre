package com.tractor.service;

import com.tractor.model.Tractor;
import com.tractor.repository.TractorRepository;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;

@Service
public class TractorService {
    private final TractorRepository repo;
    public TractorService(TractorRepository repo) { this.repo = repo; }

    /** Search + filters used by the Catalog and "Find my tractor" screens. */
    public List<Tractor> search(String q, String company, Integer minHp, Integer maxHp,
                                Integer cylinders, String drive, Double maxPrice) {
        return repo.findAll().stream()
            .filter(t -> q == null || q.isBlank() || (t.company + " " + t.model).toLowerCase().contains(q.toLowerCase()))
            .filter(t -> company == null || company.isBlank() || t.company.equalsIgnoreCase(company))
            .filter(t -> minHp == null || t.hp >= minHp)
            .filter(t -> maxHp == null || t.hp <= maxHp)
            .filter(t -> cylinders == null || t.cylinders == cylinders)
            .filter(t -> drive == null || drive.isBlank() || t.drive.equalsIgnoreCase(drive))
            .filter(t -> maxPrice == null || t.priceLakh <= maxPrice)
            .sorted(Comparator.comparingInt((Tractor t) -> t.hp).reversed())
            .toList();
    }

    public Tractor get(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Tractor not found: " + id));
    }

    public List<Tractor> compare(List<Long> ids) { return repo.findAllById(ids); }
}
