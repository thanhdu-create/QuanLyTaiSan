package com.tvu.quanlytaisan.security;

import com.tvu.quanlytaisan.entity.NguoiDung;
import com.tvu.quanlytaisan.enums.QuyenHan;
import com.tvu.quanlytaisan.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final NguoiDungRepository nguoiDungRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        NguoiDung nguoiDung = nguoiDungRepository.findByTendangnhap(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));
        
        if (!nguoiDung.getHoatdong()) {
            throw new UsernameNotFoundException("Tài khoản đã bị khóa");
        }
        
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + nguoiDung.getVaitro().name()));
        for (String code : QuyenHan.parse(nguoiDung.getQuyenhan())) {
            authorities.add(new SimpleGrantedAuthority("PERM_" + code));
        }

        return User.builder()
                .username(nguoiDung.getTendangnhap())
                .password(nguoiDung.getMatkhaumahoa())
                .authorities(authorities)
                .build();
    }
}
