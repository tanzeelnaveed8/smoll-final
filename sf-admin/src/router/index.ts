import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SignInView from '../views/SignInView.vue'
import MainLayout from '../components/layout/MainLayout.vue'
import VeterniansView from '@/views/VeterniansView.vue'
import MembersView from '@/views/MembersView.vue'
import PartnerView from '@/views/PartnerView.vue'
import CasesView from '@/views/CasesView.vue'
import AddNewVetView from '@/views/AddNewVetView.vue'
import AddPartnerView from '@/views/AddPartnerView.vue'
import VerifyPartner from '@/views/VerifyPartner.vue'
import PartnerInfoView from '@/views/PartnerInfoView.vue'
import CasePreviewView from '@/views/CasePreviewView.vue'
import MemberInfoView from '@/views/MemberInfoView.vue'
import VetInfoView from '@/views/VetInfoView.vue'
import OrganizationsView from '@/views/OrganizationsView.vue'
import OrganizationInfoView from '@/views/OrganizationInfoView.vue'
import VerifyOtpView from '@/views/VerifyOtpView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ServicesView from '@/views/ServicesView.vue'
import ProductsView from '@/views/ProductsView.vue'
import FinanceView from '@/views/FinanceView.vue'
import AddMemberView from '@/views/AddMemberView.vue'
import AddVisitView from '@/views/AddVisitView.vue'
import CounsellorsView from '@/views/CounsellorsView.vue'
import AddCounsellorView from '@/views/AddCounsellorView.vue'
import CounsellorInfoView from '@/views/CounsellorInfoView.vue'

// Smoll Home imports
import SmollHomeLayout from '@/components/smoll-home/SmollHomeLayout.vue'
import SmollHomeDashboardView from '@/views/smoll-home/SmollHomeDashboardView.vue'
import SmollHomeScheduleView from '@/views/smoll-home/SmollHomeScheduleView.vue'
import SmollHomeVisitsView from '@/views/smoll-home/SmollHomeVisitsView.vue'
import SmollHomeVisitDetailView from '@/views/smoll-home/SmollHomeVisitDetailView.vue'
import SmollHomeOrdersView from '@/views/smoll-home/SmollHomeOrdersView.vue'
import SmollHomeOrderDetailView from '@/views/smoll-home/SmollHomeOrderDetailView.vue'
import SmollHomeCustomersView from '@/views/smoll-home/SmollHomeCustomersView.vue'
import SmollHomeAddCustomerView from '@/views/smoll-home/SmollHomeAddCustomerView.vue'
import HomeVetsView from '@/views/smoll-home/HomeVetsView.vue'
import AddHomeVetView from '@/views/smoll-home/AddHomeVetView.vue'
import HomeVetInfoView from '@/views/smoll-home/HomeVetInfoView.vue'
import SmollHomeAddVisitView from '@/views/smoll-home/SmollHomeAddVisitView.vue'

// Smoll role-based imports (separate from Vet Admin)
import SmollCustomerLayout from '@/components/smoll-roles/SmollCustomerLayout.vue'
import SmollVeterinarianLayout from '@/components/smoll-roles/SmollVeterinarianLayout.vue'
import SmollFinanceLayout from '@/components/smoll-roles/SmollFinanceLayout.vue'
import SmollCustomerDashboardView from '@/views/smoll-customer/SmollCustomerDashboardView.vue'
import SmollVeterinarianDashboardView from '@/views/smoll-veterinarian/SmollVeterinarianDashboardView.vue'
import SmollFinanceDashboardView from '@/views/smoll-finance/SmollFinanceDashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          component: HomeView,
          meta: {
            title: 'Home'
          }
        },
        {
          path: '/experts',
          children: [
            {
              path: '',
              component: VeterniansView,
              meta: {
                title: 'Experts'
              }
            },
            {
              path: 'add-vet',
              component: AddNewVetView,
              meta: {
                title: 'Experts / Add expert'
              }
            },
            {
              path: ':vetId',
              component: VetInfoView,
              meta: {
                title: 'Experts / Added expert'
              }
            }
          ]
        },

        {
          path: '/members',
          children: [
            {
              path: '',
              component: MembersView,
              meta: {
                title: 'Customers'
              }
            },
            {
              path: 'add',
              component: AddMemberView,
              meta: {
                title: 'Customers / Add Customer'
              }
            },
            {
              path: ':memberId',
              component: MemberInfoView,
              meta: {
                title: 'Customers / Information'
              }
            }
          ]
        },

        {
          path: '/partners',
          children: [
            {
              path: '',
              component: PartnerView,
              meta: {
                title: 'Partners'
              }
            },
            {
              path: 'add-partner',
              component: AddPartnerView,
              meta: {
                title: 'Partner management / Add'
              }
            },
            {
              path: 'verify-partner',
              component: VerifyPartner,
              meta: {
                title: 'Partner management / Partner Request'
              }
            },
            {
              path: ':partnerId',
              component: PartnerInfoView,
              meta: {
                title: 'Partner management / Partner Information'
              }
            }
          ]
        },

        {
          path: '/visits',
          children: [
            {
              path: '',
              component: CasesView,
              meta: {
                title: 'Visits'
              }
            },
            {
              path: 'add',
              component: AddVisitView,
              meta: {
                title: 'Visits / Add Visit'
              }
            },
            {
              path: ':caseId',
              component: CasePreviewView,
              meta: {
                title: 'Visits / Details'
              }
            }
          ]
        },
        {
          path: '/cases',
          redirect: '/visits'
        },
        {
          path: '/cases/:caseId',
          redirect: (to) => `/visits/${to.params.caseId}`
        },
        // Redirects for old direct routes
        {
          path: '/services',
          redirect: '/smoll-home/services'
        },
        {
          path: '/products',
          redirect: '/smoll-home/products'
        },
        {
          path: '/finance',
          redirect: '/smoll-home/finance'
        },
        {
          path: '/settings',
          component: SettingsView,
          meta: {
            title: 'Settings'
          }
        },
        {
          path: '/counsellors',
          children: [
            {
              path: '',
              component: CounsellorsView,
              meta: {
                title: 'Counsellors'
              }
            },
            {
              path: 'add',
              component: AddCounsellorView,
              meta: {
                title: 'Counsellors / Add'
              }
            },
            {
              path: ':counsellorId',
              component: CounsellorInfoView,
              meta: {
                title: 'Counsellors / Information'
              }
            }
          ]
        },
        {
          path: '/organizations',
          children: [
            {
              path: '',
              component: OrganizationsView,
              meta: {
                title: 'Organizations'
              }
            },
            {
              path: ':id',
              component: OrganizationInfoView,
              meta: {
                title: 'Organizations / Details'
              }
            }
          ]
        }
      ]
    },
    // Smoll Home routes
    {
      path: '/smoll-home',
      component: SmollHomeLayout,
      children: [
        {
          path: '',
          component: SmollHomeDashboardView,
          meta: { title: 'Vet Admin / Dashboard' }
        },
        {
          path: 'schedule',
          component: SmollHomeScheduleView,
          meta: { title: 'Vet Admin / Schedule' }
        },
        {
          path: 'history',
          component: SmollHomeVisitsView,
          meta: { title: 'Vet Admin / Visit History' }
        },
        {
          path: 'orders',
          component: SmollHomeOrdersView,
          meta: { title: 'Vet Admin / Orders' }
        },
        {
          path: 'orders/:id',
          component: SmollHomeOrderDetailView,
          meta: { title: 'Vet Admin / Order Details' }
        },
        {
          path: 'customers',
          component: SmollHomeCustomersView,
          meta: { title: 'Vet Admin / Customers' }
        },
        {
          path: 'customers/add',
          component: SmollHomeAddCustomerView,
          meta: { title: 'Vet Admin / Add Customer' }
        },
        {
          path: 'customers/:memberId',
          component: MemberInfoView,
          meta: { title: 'Vet Admin / Customer Info' }
        },
        {
          path: 'veterinarians',
          component: HomeVetsView,
          meta: { title: 'Vet Admin / Veterinarians' }
        },
        {
          path: 'veterinarians/add',
          component: AddHomeVetView,
          meta: { title: 'Vet Admin / Add Veterinarian' }
        },
        {
          path: 'veterinarians/:vetId',
          component: HomeVetInfoView,
          meta: { title: 'Vet Admin / Veterinarian Info' }
        },
        {
          path: 'products',
          component: ProductsView,
          meta: { title: 'Vet Admin / Products' }
        },
        {
          path: 'services',
          component: ServicesView,
          meta: { title: 'Vet Admin / Services' }
        },
        {
          path: 'finance',
          component: FinanceView,
          meta: { title: 'Vet Admin / Finance' }
        },
        {
          path: 'visits/add',
          component: SmollHomeAddVisitView,
          meta: { title: 'Vet Admin / Add Visit' }
        },
        {
          path: 'visits/:id',
          component: SmollHomeVisitDetailView,
          meta: { title: 'Vet Admin / Visit Details' }
        },
      ]
    },
    // Customer routes (separate area)
    {
      path: '/smoll-customer',
      component: SmollCustomerLayout,
      children: [
        {
          path: '',
          component: SmollCustomerDashboardView,
          meta: { title: 'Customer / Dashboard' }
        }
      ]
    },
    // Veterinarian routes (separate area)
    {
      path: '/smoll-veterinarian',
      component: SmollVeterinarianLayout,
      children: [
        {
          path: '',
          component: SmollVeterinarianDashboardView,
          meta: { title: 'Veterinarian / Dashboard' }
        }
      ]
    },
    // Finance routes (separate area)
    {
      path: '/smoll-finance',
      component: SmollFinanceLayout,
      children: [
        {
          path: '',
          component: SmollFinanceDashboardView,
          meta: { title: 'Finance / Dashboard' }
        }
      ]
    },
    {
      path: '/login',
      component: SignInView
    }
    ,
    {
      path: '/verify-otp',
      component: VerifyOtpView
    }
  ]
})

export default router
