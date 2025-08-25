// LocalStorage service for CRM data persistence
export class LocalStorageService {
  private static readonly PREFIX = 'crm_';
  
  // Generic localStorage methods
  static setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.PREFIX + key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  static clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // CRM-specific data persistence methods
  static saveProperties(properties: any[]): void {
    this.setItem('properties', properties);
  }

  static getProperties(): any[] {
    return this.getItem('properties', []);
  }

  static saveTenants(tenants: any[]): void {
    this.setItem('tenants', tenants);
  }

  static getTenants(): any[] {
    return this.getItem('tenants', []);
  }

  static saveManagers(managers: any[]): void {
    this.setItem('managers', managers);
  }

  static getManagers(): any[] {
    return this.getItem('managers', []);
  }

  static saveWorkOrders(workOrders: any[]): void {
    this.setItem('workOrders', workOrders);
  }

  static getWorkOrders(): any[] {
    return this.getItem('workOrders', []);
  }

  static saveAnnouncements(announcements: any[]): void {
    this.setItem('announcements', announcements);
  }

  static getAnnouncements(): any[] {
    return this.getItem('announcements', []);
  }

  static saveNews(news: any[]): void {
    this.setItem('news', news);
  }

  static getNews(): any[] {
    return this.getItem('news', []);
  }

  static saveContacts(contacts: any[]): void {
    this.setItem('contacts', contacts);
  }

  static getContacts(): any[] {
    return this.getItem('contacts', []);
  }

  static saveApplications(applications: any[]): void {
    this.setItem('applications', applications);
  }

  static getApplications(): any[] {
    return this.getItem('applications', []);
  }

  static saveTasks(tasks: any[]): void {
    this.setItem('tasks', tasks);
  }

  static getTasks(): any[] {
    return this.getItem('tasks', []);
  }

  static saveProspects(prospects: any[]): void {
    this.setItem('prospects', prospects);
  }

  static getProspects(): any[] {
    return this.getItem('prospects', []);
  }

  static saveServiceProviders(serviceProviders: any[]): void {
    this.setItem('serviceProviders', serviceProviders);
  }

  static getServiceProviders(): any[] {
    return this.getItem('serviceProviders', []);
  }

  static savePropertyGroups(propertyGroups: any[]): void {
    this.setItem('propertyGroups', propertyGroups);
  }

  static getPropertyGroups(): any[] {
    return this.getItem('propertyGroups', []);
  }

  static saveQRCodes(qrCodes: any[]): void {
    this.setItem('qrCodes', qrCodes);
  }

  static getQRCodes(): any[] {
    return this.getItem('qrCodes', []);
  }

  static saveContactCaptures(contactCaptures: any[]): void {
    this.setItem('contactCaptures', contactCaptures);
  }

  static getContactCaptures(): any[] {
    return this.getItem('contactCaptures', []);
  }

  static saveTemplates(templates: any[]): void {
    this.setItem('templates', templates);
  }

  static getTemplates(): any[] {
    return this.getItem('templates', []);
  }

  static saveIntegrations(integrations: any[]): void {
    this.setItem('integrations', integrations);
  }

  static getIntegrations(): any[] {
    return this.getItem('integrations', []);
  }

  static saveCompanySettings(companySettings: any): void {
    this.setItem('companySettings', companySettings);
  }

  static getCompanySettings(): any {
    return this.getItem('companySettings', {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logoUrl: '',
      hours: '',
      emergencyLine: '',
      taxId: '',
      licenseNumber: ''
    });
  }

  static saveUserRoles(userRoles: any): void {
    this.setItem('userRoles', userRoles);
  }

  static getUserRoles(): any {
    return this.getItem('userRoles', {
      role: 'user', // user, admin, super_admin
      permissions: []
    });
  }

  // Generic save data method for flexibility
  static saveData<T>(key: string, data: T): void {
    this.setItem(key, data);
  }

  static getData<T>(key: string, defaultValue: T): T {
    return this.getItem(key, defaultValue);
  }

  static saveUserPreferences(preferences: any): void {
    this.setItem('userPreferences', preferences);
  }

  static getUserPreferences(): any {
    return this.getItem('userPreferences', {
      multiManagementEnabled: false,
      reminderPreferences: {},
      viewPreferences: {}
    });
  }

  static setMultiManagementEnabled(enabled: boolean): void {
    const preferences = this.getUserPreferences();
    preferences.multiManagementEnabled = enabled;
    this.setItem('userPreferences', preferences);
  }

  static isMultiManagementEnabled(): boolean {
    const preferences = this.getUserPreferences();
    return preferences.multiManagementEnabled || false;
  }

  static saveViewState(page: string, state: any): void {
    this.setItem(`viewState_${page}`, state);
  }

  static getViewState(page: string): any {
    return this.getItem(`viewState_${page}`, {});
  }

  static saveFormData(formName: string, data: any): void {
    this.setItem(`formData_${formName}`, data);
  }

  static getFormData(formName: string): any {
    return this.getItem(`formData_${formName}`, {});
  }

  static clearFormData(formName: string): void {
    this.removeItem(`formData_${formName}`);
  }

  // Sync all data to localStorage
  static syncAllData(crmData: any): void {
    try {
      if (crmData.properties) this.saveProperties(crmData.properties);
      if (crmData.tenants) this.saveTenants(crmData.tenants);
      if (crmData.managers) this.saveManagers(crmData.managers);
      if (crmData.workOrders) this.saveWorkOrders(crmData.workOrders);
      if (crmData.announcements) this.saveAnnouncements(crmData.announcements);
      if (crmData.news) this.saveNews(crmData.news);
      if (crmData.contacts) this.saveContacts(crmData.contacts);
      if (crmData.applications) this.saveApplications(crmData.applications);
      if (crmData.prospects) this.saveProspects(crmData.prospects);
      if (crmData.tasks) this.saveTasks(crmData.tasks);
      if (crmData.serviceProviders) this.saveServiceProviders(crmData.serviceProviders);
      if (crmData.propertyGroups) this.savePropertyGroups(crmData.propertyGroups);
      if (crmData.integrations) this.saveIntegrations(crmData.integrations);
    } catch (error) {
      console.error('Error syncing data to localStorage:', error);
    }
  }

  // Load all data from localStorage
  static loadAllData(): any {
    return {
      properties: this.getProperties(),
      tenants: this.getTenants(),
      managers: this.getManagers(),
      workOrders: this.getWorkOrders(),
      announcements: this.getAnnouncements(),
      news: this.getNews(),
      contacts: this.getContacts(),
      applications: this.getApplications(),
      prospects: this.getProspects(),
      tasks: this.getTasks(),
      serviceProviders: this.getServiceProviders(),
      propertyGroups: this.getPropertyGroups(),
      integrations: this.getIntegrations(),
      userPreferences: this.getUserPreferences()
    };
  }

  // Auto-save functionality
  static enableAutoSave(callback: () => any, interval: number = 30000): () => void {
    const intervalId = setInterval(() => {
      try {
        const data = callback();
        this.syncAllData(data);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }
}
