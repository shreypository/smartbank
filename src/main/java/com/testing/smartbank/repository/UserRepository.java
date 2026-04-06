package com.testing.smartbank.repository;

import com.testing.smartbank.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    User findByUserCode(String userCode);
    User findByPhone(String phone);
    User findByPanNumber(String panNumber);
    User findByAadharNumber(String aadharNumber);
}