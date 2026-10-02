package com.tractor.repository;

import com.tractor.model.Tractor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TractorRepository extends JpaRepository<Tractor, Long> { }
