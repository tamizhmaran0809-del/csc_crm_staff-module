from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.db.models import Q, Sum
from django.http import JsonResponse, HttpResponse
from django.core.paginator import Paginator
from datetime import datetime
from datetime import timedelta
import csv

from .models import *
from .forms import *


# ============================ LIST-VIEW ============================= 


def staff_management(request):
    """Display all staff members with filters and role permissions matrix"""

    queryset = Staff.objects.select_related('role', 'department').order_by('-created_at')

    # Apply filters
    department = request.GET.get('department')
    role = request.GET.get('role')
    status = request.GET.get('status')
    search = request.GET.get('search', '').strip()

    if department:
        queryset = queryset.filter(department__dept_name = department)

    if role:
        queryset = queryset.filter(role_id = role)
    
    if status:
        queryset = queryset.filter(status = status)

    if search:
        queryset = queryset.filter(
            Q(first_name__icontains = search) |
            Q(last_name__icontains = search) |
            Q(email__icontains = search) |
            Q(employee_id__icontains = search)
        )
    # Pagination
    paginator = Paginator(queryset, 15)
    page_number = request.GET.get('page')
    staff_list = paginator.get_page(page_number)

    # Get all roles and departments for filters
    all_roles = StaffRole.objects.all()
    all_departments = Department.objects.all()

    # Role permission Matrix data
    permissions_matrix = [
        {
            'module':'Leads',
            'permission':{
                'admin': 'All',
                'manager': 'All',
                'sales_exec': 'Own',
                'telecaller': 'Own',
                'support': 'View',
                'hr': 'View',
                'trainer': 'View'
            }
        },
        {
            'module': 'Staff',
            'permission':{
                'admin':'All',
                'manager':'View',
                'sales_exec': 'None',
                'telecaller': 'None',
                'support': 'None',
                'hr': 'All',
                'trainer': 'None'
            }
        },
        {
            'module': 'Reports',
            'permission':{
                'admin':'All',
                'manager':'Team',
                'sales_exec':'Own',
                'telecaller': 'None',
                'support': 'None',
                'hr': 'HR',
                'trainer': 'None'
            }
        },
        {
            'module': 'Attendance',
            'permission': {
                'admin': 'All',
                'manager': 'View',
                'sales_exec':'Own',
                'telecaller':  'Own',
                'support': 'Own',
                'hr': 'All',
                'trainer': 'Own'
            }
        }
    ]

    # Filter form
    filter_form = StaffFilterForm(request.GET)

    context = {
        'page_title': 'Staff Management',
        'staff_list': staff_list,
        'filter_form': filter_form,
        'total_staff': queryset.count(),
        'roles': all_roles,
        'departments': all_departments,
        'permissions_matrix': permissions_matrix,
        'paginator': paginator,
        'page_obj': staff_list,
        'is_paginated': staff_list.has_other_pages(),
        'page_obj_number': staff_list.number,
        'search_query': search,
    }
    return render(request, 'staff/management.html', context)

# ========================== AUTO GENERATE EMP ID ==========================

def generate_employee_id():
    last_staff = Staff.objects.order_by('-id').first()

    if last_staff:
        last_id = int(last_staff.employee_id.replace('EMP',''))
        return f"EMP{last_id + 1:03d}"
    
    return "EMP001"

# ========================== CREATE NEW STAFF ==============================

def add_staff(request):
    """Add new staff member"""

    if request.method == 'POST':
        form = StaffForm(request.POST, request.FILES)
        if form.is_valid():
            staff = form.save()
            messages.success(request, f"Staff member '{staff.full_name()}' added successfully!")
            return redirect('staff_management')
    else:
        form = StaffForm(
            initial = {
                'employee_id': generate_employee_id()
            }
        )

    context = {
        'page_title':'Add New Staff',
        'form': form
    }
    return render(request, 'staff/add_staff.html', context)

# ============================= CHECK EMAIL EXISTING (FOR VALIDATION) ===============================

def check_email(request):

    email = request.GET.get('email')
    staff_id = request.GET.get('staff_id')

    email_exists = Staff.objects.filter(
        email=email
    ).exclude(
        id=staff_id
    ).exists()

    return JsonResponse({
        'exists': email_exists
    })

# ======================= CHECK PHONE NO EXISTING (FOR VALIDATION) ====================

def check_phone(request):

    phone = request.GET.get('phone','').strip()
    staff_id = request.GET.get('staff_id')

    phone_exists = Staff.objects.filter(
        phone = phone
    ).exclude(
        id=staff_id
    ).exists()

    return JsonResponse({
        'exists':phone_exists
    })

# ========================== UPDATING STAFF ===================================

def edit_staff(request, id):
    """Update existing staff"""

    staff = get_object_or_404(Staff, id=id)

    if request.method == 'POST':
        form = EditStaffForm(request.POST, request.FILES, instance=staff)
        if form.is_valid():
            form.save()
            messages.success(request, f"Staff member '{staff.full_name()}' Updated sucessfully!")
        # else:
        #     messages.error(request, 'Please correct the errors below.')
        
            return redirect('staff_management')
        else:
            print(form.errors)
    else:
        form = StaffForm(instance=staff)

    context = {
        'page_title':f"Edit '{staff.full_name}'",
        'form':form,
        'staff':staff
    }

    return render(request, 'staff/edit_staff.html', context)

# ============================= STAFF DELETE ==================================

def delete_staff(request, id):
    """Deleting staff member"""

    staff = get_object_or_404(Staff, id=id)

    if request.method == 'POST':
        staff.status = 'terminated'
        staff.save()
        messages.success(request, f"Staff member '{staff.full_name}' terminated!")
        return redirect('staff_management')
        
    context = {
        'page_title': 'Delete Staff',
        'staff': staff,
    }

    return render(request, 'staff/confirm_delete.html', context)

# =========================== QUICK EDIT/AJAX ===================================

def quick_edit_staff(request, id):
    """Quick edit via AJAX"""

    staff = get_object_or_404(Staff, id=id)

    if request.method == 'POST':
        form = StaffQuickEditForm(request.POST, instance=staff)
        if form.is_valid():
            form.save()

            # Check if it's an AJAX request
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'message': 'Updated Successfully'
                })
            else:
                messages.success(request, f"Staff '{staff.full_name}' updated successfully!")
        else:
            # Return JSON error response for AJAX
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'errors': form.errors
                })
    else:
        form = StaffQuickEditForm(instance=staff)

    context = {
        'page_title': f'Quick Edit - {staff.full_name}',
        'form': form,
        'staff': staff
    }

    return render(request, 'staff/quick_edit.html', context)

# ============================ EXPORT - STAFF LIST TO CSV ===============================

def export_staff(request):
    """Export staff list as CSV"""

    response = HttpResponse(content_type ='text/csv')
    response['Content-Disposition'] = 'attachement; filename="staff_list.csv"'

    writer = csv.writer(response)
    writer.writerow([
        'Employee ID', 'Name', 'Email', 'Phone', 'Role', 'Department',
        'Status', 'Monthly Target', 'Performance Rating', 'Date of Joining'
    ])

    # Get all staff
    staff_list = Staff.objects.select_related('role', 'department').all()

    department = request.GET.get('department')
    role = request.GET.get('role')
    search = request.GET.get('search', '').strip()

    if department:
        staff_list = staff_list.filter(
            department__dept_name=department
        )

    if role:
        staff_list = staff_list.filter(
            role_id=role
        )

    if search:
        staff_list = staff_list.filter(
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search) |
            Q(email__icontains=search) |
            Q(employee_id__icontains=search)
        )

    for staff in staff_list:
        writer.writerow([
            staff.employee_id,
            staff.full_name(),
            staff.email,
            staff.phone,
            staff.role.get_role_name_display(),
            staff.department.get_dept_name_display(),
            staff.get_status_display(),
            staff.monthly_target,
            staff.performance_rating,
            staff.date_of_joining.strftime('%d-%m-%Y'),
        ])

    return response

# ================================================ STAFF OVERVIEW ====================================================
# ============================== DASHBOARD ==============================

def overview(request, staff_id=None):

    # ======= STAFF =======
    if staff_id:
        staff = get_object_or_404(Staff, id=staff_id)
    else:
        staff = Staff.objects.filter(status="active").first()

    if not staff:
        return render(request, "staff/overview.html", {
            "error": "No staff found"
        })

    # ======= TRAINER SCHEDULE =======
    if request.method == "POST":
        date = request.POST.get("date")
        time = request.POST.get("time")
        type_value = request.POST.get("type")
        topic = request.POST.get("topic")
        status = request.POST.get("status", "upcoming")

        if all([date, time, type_value, topic]):
            TrainerSchedule.objects.create(
                staff=staff,
                date=date,
                time=time,
                type=type_value,
                topic=topic,
                status=status
            )

    # ======= LEADS =======
    leads = Lead.objects.filter(staff=staff)

    assigned_leads = leads.filter(status="assigned").count()
    converted_leads = leads.filter(status="converted").count()
    pending_leads = leads.filter(
        status__in=["new", "assigned", "in_progress"]
    ).count()

    recent_leads = leads.order_by("-created_at")[:10]

    # ======= REVENUE =======
    revenue_qs = Revenue.objects.filter(staff=staff)

    total_revenue = revenue_qs.aggregate(
        total=Sum("amount")
    )["total"] or 0

    now = timezone.now()

    this_month_revenue = revenue_qs.filter(
        created_at__year=now.year,
        created_at__month=now.month
    ).aggregate(total=Sum("amount"))["total"] or 0

    # Previous Month
    if now.month == 1:
        last_month = 12
        last_year = now.year - 1
    else:
        last_month = now.month - 1
        last_year = now.year

    last_month_revenue = revenue_qs.filter(
        created_at__year=last_year,
        created_at__month=last_month
    ).aggregate(total=Sum("amount"))["total"] or 0

    # ======= WEEKLY GRAPH =======
    week_data_this = []
    week_data_last = []

    start_of_month = now.replace(day=1)

    for week in range(5):

        start = start_of_month + timedelta(days=week * 7)
        end = start + timedelta(days=6)

        current_revenue = revenue_qs.filter(
            created_at__date__range=(start.date(), end.date())
        ).aggregate(total=Sum("amount"))["total"] or 0

        previous_revenue = revenue_qs.filter(
            created_at__date__range=(
                (start.replace(year=last_year)).date(),
                (end.replace(year=last_year)).date()
            )
        ).aggregate(total=Sum("amount"))["total"] or 0

        week_data_this.append(float(current_revenue))
        week_data_last.append(float(previous_revenue))

    # ======= TARGET PROGRESS =======
    target_amount = staff.monthly_target or 0

    # Monthly target => this month revenue
    completed_amount = this_month_revenue

    if target_amount > 0:
        progress_percentage = round(
            (completed_amount / target_amount) * 100
        )
    else:
        progress_percentage = 0

    progress_percentage = min(progress_percentage, 100)

    # ======= ATTENDANCE =======
    today = timezone.now().date()

    today_attendance = Attendance.objects.filter(
        staff=staff,
        date=today
    ).order_by("-id").first()

    today_status = (
        today_attendance.status
        if today_attendance
        else "Absent"
    )

    # ======= TRAINER SCHEDULES =======
    schedules = TrainerSchedule.objects.filter(
        staff=staff
    ).order_by("-date", "-time")

    # ======= CONTEXT =======
    context = {
        "staff": staff,
        "assigned_leads": assigned_leads,
        "converted_leads": converted_leads,
        "pending_leads": pending_leads,
        "recent_leads": recent_leads,
        "total_revenue": total_revenue,
        "this_month_revenue": this_month_revenue,
        "last_month_revenue": last_month_revenue,
        "week_data_this": week_data_this,
        "week_data_last": week_data_last,
        "completed_amount": completed_amount,
        "progress_percentage": progress_percentage,
        "today_attendance": today_attendance,
        "today_status": today_status,
        "schedules": schedules,
    }

    return render(request, "staff/overview.html", context)

# ============================== EXPORT CSV ==============================

def staff_export(request, id):

    staff = get_object_or_404(Staff, id=id)

    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = (
        f'attachment; filename="{staff.employee_id}_report.csv"'
    )

    writer = csv.writer(response)

    # ================= STAFF DETAILS =================
    writer.writerow(['STAFF DETAILS'])

    writer.writerow([
        'Employee ID',
        'Name',
        'Email',
        'Phone',
        'Role',
        'Department',
        'Status',
        'Monthly Target',
        'Performance Rating',
        'Date Of Joining'
    ])

    writer.writerow([
        staff.employee_id,
        staff.full_name(),
        staff.email,
        staff.phone,
        staff.role.get_role_name_display(),
        staff.department.get_dept_name_display(),
        staff.get_status_display(),
        staff.monthly_target,
        staff.performance_rating,
        staff.date_of_joining.strftime('%d-%m-%Y') if staff.date_of_joining else ''
    ])

    writer.writerow([])

    role_name = staff.role.role_name

    # ================= LEADS EXPORT =================
    if role_name in ['sales_executive', 'telecaller']:

        leads = Lead.objects.filter(staff=staff)

        writer.writerow(['LEADS DATA'])

        writer.writerow([
            'Lead Name',
            'Phone',
            'Email',
            'Status',
            'Created At'
        ])

        for lead in leads:
            writer.writerow([
                lead.name,
                lead.phone,
                lead.email or '',
                lead.get_status_display(),
                lead.created_at.strftime('%d-%m-%Y %H:%M')
            ])

    # ================= TRAINER EXPORT =================
    elif role_name == 'trainer':

        schedules = TrainerSchedule.objects.filter(
            staff=staff
        ).order_by('-date', '-time')

        writer.writerow(['TRAINING SCHEDULE'])

        writer.writerow([
            'Date',
            'Time',
            'Class / Meeting',
            'Topic',
            'Status'
        ])

        for schedule in schedules:
            writer.writerow([
                schedule.date.strftime('%d-%m-%Y'),
                schedule.time.strftime('%I:%M %p'),
                schedule.get_type_display(),
                schedule.topic,
                schedule.get_status_display(),
            ])

    return response

#============================================================Attendance page=======================================================================   
def attendance_page(request, id):

    staff = get_object_or_404(Staff, id=id)

    # ================= TODAY =================
    today = timezone.localdate()

    today_attendance = Attendance.objects.filter(staff=staff,date=today ).first()

    today_status = today_attendance.status if today_attendance else 'Absent'

    # ================= HISTORY =================
    attendance_data = Attendance.objects.filter( staff=staff).order_by('-date')

    filter_date = request.GET.get('date')
    month = request.GET.get('month')
    year = request.GET.get('year')

    if filter_date:
        attendance_data = attendance_data.filter(date=filter_date)

    if month:
        attendance_data = attendance_data.filter(date__month=month)

    if year:
        attendance_data = attendance_data.filter(date__year=year)

    # ================= COUNTS =================
    total_working_days = attendance_data.count()
    present_days = attendance_data.filter(status__in=['Present', 'Late']).count()
    absent_days = attendance_data.filter(status='Absent').count()
    leave_days = attendance_data.filter(status='Leave').count()
    late_days = attendance_data.filter(status='Late').count()

    attendance_score = (attendance_data.filter(status='Present').count() +(late_days * 0.5))

    if total_working_days > 0:
        attendance_percentage = int(attendance_score / total_working_days * 100)
    else:
        attendance_percentage = 0

    # ================= CONTEXT =================
    context = {
        'attendance_data': attendance_data,
        'total_working_days': total_working_days,
        'present_days': present_days,
        'absent_days': absent_days,
        'leave_days': leave_days,
        'late_days': late_days,
        'attendance_percentage': attendance_percentage,
        'today_status': today_status,
        'today_attendance': today_attendance,
        'staff': staff,
    }

    return render(request, 'staff/attendance.html', context)

#==================================================================staff-checkin page===============================================
def staff_checkin(request, id):

    staff = Staff.objects.get(id=id)
    today = timezone.localdate()

    old_attendance = Attendance.objects.filter( staff=staff, log_out__isnull=True).order_by('-date').first()

    if old_attendance and old_attendance.date < today:
        old_attendance.log_out = old_attendance.log_in
        old_attendance.total_hours = "0h 0m"
        old_attendance.save()

    # ================= TODAY ATTENDANCE =================
    today_attendance = Attendance.objects.filter(staff=staff, date=today).first()

    # ===== SMART FLAGS =====
    is_checkin_done = False
    is_checkout_done = False
    is_leave_or_absent = False

    if today_attendance:

        if today_attendance.log_in:
            is_checkin_done = True

        if today_attendance.log_out:
            is_checkout_done = True

        if today_attendance.status in ['Leave', 'Absent']:
            is_leave_or_absent = True

    # ================= POST =================
    if request.method == 'POST':

        action = request.POST.get('action')
        current_time = timezone.localtime(timezone.now())

        attendance = Attendance.objects.filter(
            staff=staff,
            date=today
        ).first()

        if not attendance:
            attendance = Attendance(staff=staff, date=today)

        # -------- CHECKIN --------
        if action == 'checkin':
            if not attendance.log_in:
                attendance.log_in = current_time

                office_time = datetime.strptime("09:15", "%H:%M").time()

                if current_time.time() > office_time:
                    attendance.status = 'Late'
                else:
                    attendance.status = 'Present'

                attendance.save()
                messages.success(request, "Check-In completed successfully.")

        # -------- CHECKOUT --------
        elif action == 'checkout':
            if attendance.log_in:
                attendance.log_out = current_time
                attendance.save()
                messages.success(request, "Check-Out completed successfully.")

        # -------- LEAVE --------
        elif action == 'leave':
            attendance.status = 'Leave'
            attendance.log_in = None
            attendance.log_out = None
            attendance.total_hours = None
            attendance.save()
            messages.success(request, "Leave marked successfully.")

        # -------- ABSENT --------
        elif action == 'absent':
            attendance.status = 'Absent'
            attendance.log_in = None
            attendance.log_out = None
            attendance.total_hours = None
            attendance.save()
            messages.success(request, "Absent marked successfully.")

        return redirect('attendance', id=staff.id)

    return render(request, 'staff/staff_checkin.html', {
        'active_attendance': Attendance.objects.filter(
            staff=staff,
            log_in__isnull=False,
            log_out__isnull=True
        ).order_by('-id').first(),
        'staff': staff,

        #  IMPORTANT FLAGS
        'is_checkin_done': is_checkin_done,
        'is_checkout_done': is_checkout_done,
        'is_leave_or_absent': is_leave_or_absent,
    })

#======================================== DOCUMENT =========================================
