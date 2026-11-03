package com.mentora.controller;

import com.mentora.entity.Categories;
//import com.mentora.repository.CategoriesRepo;
import com.mentora.repository.CategoryRepo;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/categories")
//@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

	@Autowired
    private CategoryRepo categoryRepo;

    

    @GetMapping("getAll")
    public ResponseEntity<List<Categories>> getAllCategories() {
        List<Categories> categories = categoryRepo.findAll();
        return ResponseEntity.ok(categories);
    }
}