# -*- coding: utf-8 -*-
from flask import render_template
from . import main_bp

@main_bp.route('/')
def home():
    return render_template('index.html')

@main_bp.route('/student')
def student():
    return render_template('student.html')

@main_bp.route('/teacher')
def teacher():
    return render_template('teacher.html')

@main_bp.route('/teacher/create-question')
def teacher_create_question():
    return render_template('teacher/create_question.html')

@main_bp.route('/teacher/paper-management')
def teacher_paper_management():
    return render_template('teacher/paper_management.html')
